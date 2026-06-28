from django.test import TestCase
from assessments.models import Questionnaire, Question
from assessments.analysis import scoring, recommendations


class ScoringTest(TestCase):
    def setUp(self):
        self.qn = Questionnaire.objects.create(title="S", status="active")
        self.rate = Question.objects.create(questionnaire=self.qn, question_text="Distress?", question_type="rating_scale", order=1)
        self.yn = Question.objects.create(questionnaire=self.qn, question_text="Sleeps well?", question_type="yes_no", concern_direction="lower", order=2)
        self.emo = Question.objects.create(questionnaire=self.qn, question_text="Mood?", question_type="emotion", options=["Happy", "Sad"], concern_options=["Sad"], order=3)

    def _score(self, answers):
        responses = [{"question": qid, "answer": a} for qid, a in answers]
        return scoring.score(self.qn, responses)

    def test_high_concern(self):
        r = self._score([(self.rate.id, "5"), (self.yn.id, "No"), (self.emo.id, "Sad")])
        self.assertEqual(r["behavioral_score"], 100.0)
        self.assertEqual(r["classification"], "Needs Counseling Attention")

    def test_low_concern(self):
        r = self._score([(self.rate.id, "1"), (self.yn.id, "Yes"), (self.emo.id, "Happy")])
        self.assertEqual(r["behavioral_score"], 0.0)
        self.assertEqual(r["classification"], "Normal")

    def test_mid_concern_is_monitoring(self):
        r = self._score([(self.rate.id, "3"), (self.yn.id, "No"), (self.emo.id, "Happy")])
        self.assertEqual(r["behavioral_score"], 50.0)
        self.assertEqual(r["classification"], "Needs Monitoring")

    def test_unmarked_choice_not_scored(self):
        q = Question.objects.create(questionnaire=self.qn, question_text="Pick", question_type="multiple_choice", options=["A", "B"], order=4)
        r = self._score([(self.rate.id, "1"), (q.id, "A")])
        self.assertEqual(r["scored_count"], 1)

    def test_no_scorable_defaults_monitoring(self):
        qn2 = Questionnaire.objects.create(title="E")
        q = Question.objects.create(questionnaire=qn2, question_text="Pick", question_type="multiple_choice", options=["A"], order=1)
        r = scoring.score(qn2, [{"question": q.id, "answer": "A"}])
        self.assertIsNone(r["behavioral_score"])
        self.assertEqual(r["classification"], "Needs Monitoring")


class RecommendationTest(TestCase):
    def test_priority_by_classification(self):
        self.assertEqual(recommendations.recommend({"classification": "Normal", "top_concerns": []})["priority_level"], "Low")
        self.assertEqual(recommendations.recommend({"classification": "Needs Monitoring", "top_concerns": ["Sleep"]})["priority_level"], "Medium")
        high = recommendations.recommend({"classification": "Needs Counseling Attention", "top_concerns": ["Distress?"]})
        self.assertEqual(high["priority_level"], "High")
        self.assertIn("Distress?", high["recommendation_text"])
        self.assertIn("decision support", high["recommendation_text"])
