from rest_framework.permissions import BasePermission
from accounts.models import Role


def _role_name(request):
    role = getattr(request.user, "role", None)
    return role.role_name if role else None


class IsAdministrator(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and _role_name(request) == Role.ADMINISTRATOR)


class IsAdminOrStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and _role_name(request) in (Role.ADMINISTRATOR, Role.STAFF))
