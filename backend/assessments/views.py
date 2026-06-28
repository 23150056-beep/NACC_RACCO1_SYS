from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from accounts.models import Role
from accounts.permissions import CanManageInstruments, CanTakeAssessments
from activity.models import ActivityLog
from activity.services import log_activity
from assessments.models import Questionnaire, Assessment, AssessmentResult, Recommendation
from assessments.serializers import (
    QuestionnaireSerializer, AssessmentWriteSerializer, AssessmentListSerializer,
)
from assessments.analysis import scoring, recommendations
from assessments.extraction.base import ExtractionError
from assessments.extraction.ocr_heuristic import OcrHeuristicExtractor

ALLOWED_UPLOAD_TYPES = ("application/pdf", "image/png", "image/jpeg")
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


def get_extractor():
    # Swap point: return an LlmExtractor() here once an API key/budget exists.
    return OcrHeuristicExtractor()


class QuestionnaireViewSet(viewsets.ModelViewSet):
    permission_classes = [CanManageInstruments]
    pagination_class = None
    serializer_class = QuestionnaireSerializer

    def get_queryset(self):
        qs = Questionnaire.objects.all().order_by("-created_at")
        if self.request.query_params.get("include_archived") != "true":
            qs = qs.exclude(status=Questionnaire.ARCHIVED)
        return qs

    def _log(self, obj, action_name):
        log_activity(self.request.user, action_name, ActivityLog.RECORD,
                     entity_type="Questionnaire", entity_label=obj.title, entity_id=obj.id)

    def perform_create(self, serializer):
        self._log(serializer.save(), ActivityLog.CREATED)

    def perform_update(self, serializer):
        self._log(serializer.save(), ActivityLog.UPDATED)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        obj = self.get_object()
        obj.status = Questionnaire.ARCHIVED
        obj.save(update_fields=["status", "updated_at"])
        self._log(obj, ActivityLog.ARCHIVED)
        return Response({"status": "archived"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        obj = self.get_object()
        obj.status = Questionnaire.ACTIVE
        obj.save(update_fields=["status", "updated_at"])
        return Response({"status": "active"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def extract(self, request):
        upload = request.FILES.get("file")
        if not upload:
            return Response({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        if upload.size > MAX_UPLOAD_BYTES:
            return Response({"detail": "File too large (max 10 MB)."}, status=status.HTTP_400_BAD_REQUEST)
        if upload.content_type not in ALLOWED_UPLOAD_TYPES:
            return Response({"detail": "Unsupported file type. Upload a PDF, PNG, or JPG."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            draft = get_extractor().extract(upload.read(), upload.content_type)
        except ExtractionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(draft, status=status.HTTP_200_OK)


class ActiveQuestionnaireListView(generics.ListAPIView):
    permission_classes = [CanTakeAssessments]
    pagination_class = None
    serializer_class = QuestionnaireSerializer

    def get_queryset(self):
        return Questionnaire.objects.filter(status=Questionnaire.ACTIVE).order_by("title")


class AssessmentViewSet(viewsets.ModelViewSet):
    permission_classes = [CanTakeAssessments]
    pagination_class = None

    def get_queryset(self):
        qs = Assessment.objects.select_related("child", "questionnaire", "psychologist").order_by("-assessment_date", "-id")
        role = getattr(getattr(self.request.user, "role", None), "role_name", None)
        if role != Role.ADMINISTRATOR:
            qs = qs.filter(psychologist=self.request.user)
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return AssessmentWriteSerializer
        return AssessmentListSerializer

    def perform_create(self, serializer):
        assessment = serializer.save(psychologist=self.request.user, status="completed")
        self._persist_analysis(assessment)
        log_activity(self.request.user, ActivityLog.CREATED, ActivityLog.RECORD,
                     entity_type="Assessment", entity_label=assessment.child.fullname, entity_id=assessment.id)

    def _persist_analysis(self, assessment):
        if not assessment.questionnaire_id:
            return
        responses = [{"question": r.question_id, "answer": r.answer} for r in assessment.responses.all()]
        result = scoring.score(assessment.questionnaire, responses)
        rec = recommendations.recommend(result)
        ar = AssessmentResult.objects.create(
            assessment=assessment,
            behavioral_score=result["behavioral_score"],
            classification=result["classification"],
            assessment_date=assessment.assessment_date,
            assessment_type=assessment.assessment_type,
        )
        Recommendation.objects.create(
            result=ar, recommendation_text=rec["recommendation_text"], priority_level=rec["priority_level"])

    @action(detail=False, methods=["post"])
    def analyze(self, request):
        try:
            questionnaire = Questionnaire.objects.get(pk=request.data.get("questionnaire"))
        except Questionnaire.DoesNotExist:
            return Response({"detail": "Questionnaire not found."}, status=status.HTTP_400_BAD_REQUEST)
        result = scoring.score(questionnaire, request.data.get("responses", []))
        rec = recommendations.recommend(result)
        return Response({**result, **rec}, status=status.HTTP_200_OK)
