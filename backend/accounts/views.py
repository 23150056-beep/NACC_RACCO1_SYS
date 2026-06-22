from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from accounts.serializers import LoginSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
