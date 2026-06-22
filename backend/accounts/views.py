from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from accounts.models import Role
from accounts.permissions import IsAdministrator
from accounts.serializers import (
    LoginSerializer, UserSerializer, UserWriteSerializer, RoleSerializer,
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdministrator]
    pagination_class = None

    def get_queryset(self):
        qs = User.objects.all().order_by("last_name", "first_name")
        if self.request.query_params.get("include_archived") != "true":
            qs = qs.exclude(status=User.ARCHIVED)
        return qs

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return UserWriteSerializer
        return UserSerializer

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        user = self.get_object()
        user.status = User.ARCHIVED
        user.is_active = False
        user.save(update_fields=["status", "is_active", "updated_at"])
        return Response({"status": "archived"}, status=status.HTTP_200_OK)


class RoleListView(generics.ListAPIView):
    permission_classes = [IsAdministrator]
    pagination_class = None
    serializer_class = RoleSerializer

    def get_queryset(self):
        return Role.objects.all().order_by("role_name")
