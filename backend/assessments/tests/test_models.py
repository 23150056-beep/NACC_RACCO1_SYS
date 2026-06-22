from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Role
from children.models import Child
from assessments.models import (
    Questionnaire, Question, Assessment, Response, AssessmentResult, Recommendation,
)

User = get_user_model()


class AssessmentModelTest(TestCase):
    def test_full_assessment_chain(self):
        role = Role.objects.create(role_name=Role.COUNSELOR)
        counselor = User.objects.create_user(
            email="c@racco1.gov.ph", username="c", password="x", role=role)
        child = Child.objects.create(fullname="Juan", case_type="Foster")
        q = Questionnaire.objects.create(title="Ages 5-8", age_group="5-8")
        question = Question.objects.create(
            questionnaire=q, question_text="How do you feel?", question_type="emotion")
        a = Assessment.objects.create(
            child=child, counselor=counselor, assessment_type="Intake")
        Response.objects.create(assessment=a, question=question, answer="happy")
        result = AssessmentResult.objects.create(
            assessment=a, behavioral_score=12.5, classification="Needs Monitoring")
        rec = Recommendation.objects.create(
            result=result, recommendation_text="Schedule follow-up", priority_level="Medium")
        self.assertEqual(rec.result.assessment.child.fullname, "Juan")
        self.assertEqual(result.classification, "Needs Monitoring")
