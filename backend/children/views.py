from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import RecordsAccess
from children.models import Guardian, Child
from children.serializers import GuardianSerializer, ChildSerializer


class _ArchivableViewSet(viewsets.ModelViewSet):
    permission_classes = [RecordsAccess]
    pagination_class = None
    model = None

    def get_queryset(self):
        qs = self.model.objects.all().order_by("fullname")
        if self.request.query_params.get("include_archived") != "true":
            qs = qs.exclude(status=self.model.ARCHIVED)
        return qs

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        obj = self.get_object()
        obj.status = self.model.ARCHIVED
        obj.save(update_fields=["status", "updated_at"])
        return Response({"status": "archived"}, status=status.HTTP_200_OK)


class GuardianViewSet(_ArchivableViewSet):
    model = Guardian
    serializer_class = GuardianSerializer


class ChildViewSet(_ArchivableViewSet):
    model = Child
    serializer_class = ChildSerializer
