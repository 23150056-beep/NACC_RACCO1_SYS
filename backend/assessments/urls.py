from django.urls import path
from rest_framework.routers import DefaultRouter
from assessments.views import QuestionnaireViewSet, AssessmentViewSet, ActiveQuestionnaireListView

router = DefaultRouter()
router.register("questionnaires", QuestionnaireViewSet, basename="questionnaire")
router.register("assessments", AssessmentViewSet, basename="assessment")

urlpatterns = router.urls + [
    path("active-questionnaires/", ActiveQuestionnaireListView.as_view(), name="active-questionnaires"),
]
