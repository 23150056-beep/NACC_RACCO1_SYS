from rest_framework.routers import DefaultRouter
from assessments.views import QuestionnaireViewSet

router = DefaultRouter()
router.register("questionnaires", QuestionnaireViewSet, basename="questionnaire")

urlpatterns = router.urls
