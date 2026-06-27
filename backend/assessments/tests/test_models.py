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
        role = Role.objects.create(role_name=Role.PSYCHOLOGIST)
        psychologist = User.objects.create_user(
            email="c@racco1.gov.ph", username="c", password="x", role=role)
        child = Child.objects.create(fullname="Juan", case_type="Foster")
        q = Questionnaire.objects.create(title="Ages 5-8", age_group="5-8")
        question = Question.objects.create(
            questionnaire=q, question_text="How do you feel?", question_type="emotion")
        a = Assessment.objects.create(
            child=child, psychologist=psychologist, assessment_type="Intake")
        Response.objects.create(assessment=a, question=question, answer="happy")
        result = AssessmentResult.objects.create(
            assessment=a, behavioral_score=12.5, classification="Needs Monitoring")
        rec = Recommendation.objects.create(
            result=result, recommendation_text="Schedule follow-up", priority_level="Medium")
        self.assertEqual(rec.result.assessment.child.fullname, "Juan")
        self.assertEqual(result.classification, "Needs Monitoring")


class QuestionnaireFieldsTest(TestCase):
    def test_questionnaire_status_and_question_fields(self):
        from assessments.models import Questionnaire, Question
        qn = Questionnaire.objects.create(title="SDQ", age_group="5-8")
        self.assertEqual(qn.status, "draft")
        q = Question.objects.create(
            questionnaire=qn, question_text="I am kind.",
            question_type="rating_scale", options=[], order=1)
        self.assertEqual(q.order, 1)
        self.assertEqual(q.options, [])
