from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from accounts.models import Role
from assessments.models import Questionnaire

User = get_user_model()


class QuestionnaireApiTest(APITestCase):
    def setUp(self):
        self.admin_role = Role.objects.create(role_name=Role.ADMINISTRATOR)
        self.psy_role = Role.objects.create(role_name=Role.PSYCHOLOGIST)
        self.staff_role = Role.objects.create(role_name=Role.STAFF)
        self.admin = User.objects.create_user(
            email="a@racco1.gov.ph", username="a", password="pass1234", role=self.admin_role)
        self.psy = User.objects.create_user(
            email="p@racco1.gov.ph", username="p", password="pass1234", role=self.psy_role)
        self.staff = User.objects.create_user(
            email="s@racco1.gov.ph", username="s", password="pass1234", role=self.staff_role)

    def _auth(self, email):
        token = self.client.post("/api/auth/login/", {
            "email": email, "password": "pass1234"}).data["access"]
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

    def _payload(self):
        return {
            "title": "SDQ", "age_group": "5-8", "status": "draft",
            "questions": [
                {"question_text": "I am kind.", "question_type": "rating_scale", "options": [], "order": 1},
                {"question_text": "Do you sleep well?", "question_type": "yes_no", "options": [], "order": 2},
            ],
        }

    def test_psychologist_can_create_with_questions(self):
        self._auth("p@racco1.gov.ph")
        resp = self.client.post("/api/questionnaires/", self._payload(), format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(len(resp.data["questions"]), 2)
        self.assertEqual(Questionnaire.objects.count(), 1)

    def test_admin_can_list(self):
        Questionnaire.objects.create(title="X")
        self._auth("a@racco1.gov.ph")
        resp = self.client.get("/api/questionnaires/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)

    def test_staff_forbidden(self):
        self._auth("s@racco1.gov.ph")
        self.assertEqual(self.client.get("/api/questionnaires/").status_code, 403)
        self.assertEqual(
            self.client.post("/api/questionnaires/", self._payload(), format="json").status_code, 403)

    def test_update_replaces_questions(self):
        self._auth("p@racco1.gov.ph")
        qid = self.client.post("/api/questionnaires/", self._payload(), format="json").data["id"]
        upd = self._payload()
        upd["questions"] = [{"question_text": "Only one.", "question_type": "yes_no", "options": [], "order": 1}]
        resp = self.client.put(f"/api/questionnaires/{qid}/", upd, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data["questions"]), 1)

    def test_archive_hides_from_list(self):
        self._auth("a@racco1.gov.ph")
        qid = self.client.post("/api/questionnaires/", self._payload(), format="json").data["id"]
        self.client.post(f"/api/questionnaires/{qid}/archive/")
        self.assertEqual(len(self.client.get("/api/questionnaires/").data), 0)


import fitz  # PyMuPDF
from django.core.files.uploadedfile import SimpleUploadedFile


class ExtractEndpointTest(QuestionnaireApiTest):
    def _pdf_file(self):
        doc = fitz.open()
        doc.new_page().insert_text((72, 72), "1. The child is calm.\n2. Sleeps well?", fontsize=11)
        return SimpleUploadedFile("form.pdf", doc.tobytes(), content_type="application/pdf")

    def test_extract_returns_draft_without_saving(self):
        self._auth("p@racco1.gov.ph")
        resp = self.client.post("/api/questionnaires/extract/", {"file": self._pdf_file()}, format="multipart")
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.data["questions"]), 2)
        self.assertEqual(Questionnaire.objects.count(), 0)

    def test_extract_forbidden_for_staff(self):
        self._auth("s@racco1.gov.ph")
        resp = self.client.post("/api/questionnaires/extract/", {"file": self._pdf_file()}, format="multipart")
        self.assertEqual(resp.status_code, 403)

    def test_extract_rejects_missing_file(self):
        self._auth("a@racco1.gov.ph")
        resp = self.client.post("/api/questionnaires/extract/", {}, format="multipart")
        self.assertEqual(resp.status_code, 400)


from assessments.models import Question, Assessment, Response
from children.models import Child


class AssessmentTakingTest(APITestCase):
    def setUp(self):
        self.admin_role = Role.objects.create(role_name=Role.ADMINISTRATOR)
        self.psy_role = Role.objects.create(role_name=Role.PSYCHOLOGIST)
        self.staff_role = Role.objects.create(role_name=Role.STAFF)
        self.admin = User.objects.create_user(
            email="a@racco1.gov.ph", username="a", password="pass1234", role=self.admin_role)
        self.psy = User.objects.create_user(
            email="p@racco1.gov.ph", username="p", password="pass1234", role=self.psy_role)
        self.staff = User.objects.create_user(
            email="s@racco1.gov.ph", username="s", password="pass1234", role=self.staff_role)
        self.child = Child.objects.create(fullname="Ana Lopez", case_type="Foster")
        self.qn = Questionnaire.objects.create(title="SDQ", status="active")
        self.q1 = Question.objects.create(questionnaire=self.qn, question_text="Calm?", question_type="yes_no", order=1)
        self.q2 = Question.objects.create(questionnaire=self.qn, question_text="Sleeps?", question_type="rating_scale", order=2)
        self.draft = Questionnaire.objects.create(title="Draft one", status="draft")

    def _auth(self, email):
        token = self.client.post("/api/auth/login/", {
            "email": email, "password": "pass1234"}).data["access"]
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

    def _assessment_payload(self):
        return {
            "child": self.child.id, "questionnaire": self.qn.id, "assessment_type": "Intake",
            "classification": "Normal Development", "notes": "Adjusting well.",
            "responses": [
                {"question": self.q1.id, "answer": "Yes"},
                {"question": self.q2.id, "answer": "4"},
            ],
        }

    def test_active_questionnaires_lists_only_active(self):
        self._auth("p@racco1.gov.ph")
        resp = self.client.get("/api/active-questionnaires/")
        self.assertEqual(resp.status_code, 200)
        titles = [q["title"] for q in resp.data]
        self.assertIn("SDQ", titles)
        self.assertNotIn("Draft one", titles)

    def test_active_questionnaires_forbidden_for_staff(self):
        self._auth("s@racco1.gov.ph")
        self.assertEqual(self.client.get("/api/active-questionnaires/").status_code, 403)

    def test_psychologist_creates_assessment_with_responses(self):
        self._auth("p@racco1.gov.ph")
        resp = self.client.post("/api/assessments/", self._assessment_payload(), format="json")
        self.assertEqual(resp.status_code, 201)
        a = Assessment.objects.get()
        self.assertEqual(a.status, "completed")
        self.assertEqual(a.psychologist, self.psy)
        self.assertEqual(a.notes, "Adjusting well.")
        self.assertEqual(a.responses.count(), 2)

    def test_staff_cannot_create_assessment(self):
        self._auth("s@racco1.gov.ph")
        resp = self.client.post("/api/assessments/", self._assessment_payload(), format="json")
        self.assertEqual(resp.status_code, 403)

    def test_psychologist_lists_only_own_assessments(self):
        Assessment.objects.create(child=self.child, psychologist=self.admin, status="completed")
        self._auth("p@racco1.gov.ph")
        self.client.post("/api/assessments/", self._assessment_payload(), format="json")
        resp = self.client.get("/api/assessments/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)

    def test_admin_sees_all_assessments(self):
        Assessment.objects.create(child=self.child, psychologist=self.psy, status="completed")
        self._auth("a@racco1.gov.ph")
        resp = self.client.get("/api/assessments/")
        self.assertEqual(len(resp.data), 1)

    def test_respondent_mode_defaults_to_staff(self):
        self._auth("p@racco1.gov.ph")
        self.client.post("/api/assessments/", self._assessment_payload(), format="json")
        self.assertEqual(Assessment.objects.get().respondent_mode, "staff")

    def test_respondent_mode_child_is_saved(self):
        self._auth("p@racco1.gov.ph")
        payload = self._assessment_payload()
        payload["respondent_mode"] = "child"
        self.client.post("/api/assessments/", payload, format="json")
        self.assertEqual(Assessment.objects.get().respondent_mode, "child")

    def test_analyze_returns_result_without_saving(self):
        from assessments.models import AssessmentResult
        self._auth("p@racco1.gov.ph")
        resp = self.client.post("/api/assessments/analyze/", {
            "questionnaire": self.qn.id,
            "responses": [{"question": self.q1.id, "answer": "No"}, {"question": self.q2.id, "answer": "5"}],
        }, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("behavioral_score", resp.data)
        self.assertIn("recommendation_text", resp.data)
        self.assertEqual(AssessmentResult.objects.count(), 0)

    def test_analyze_forbidden_for_staff(self):
        self._auth("s@racco1.gov.ph")
        resp = self.client.post("/api/assessments/analyze/", {"questionnaire": self.qn.id, "responses": []}, format="json")
        self.assertEqual(resp.status_code, 403)

    def test_submit_persists_result_and_recommendation(self):
        from assessments.models import AssessmentResult, Recommendation
        self._auth("p@racco1.gov.ph")
        self.client.post("/api/assessments/", self._assessment_payload(), format="json")
        self.assertEqual(AssessmentResult.objects.count(), 1)
        self.assertEqual(Recommendation.objects.count(), 1)
        self.assertTrue(AssessmentResult.objects.first().classification)

    def test_staff_can_view_results_sees_all(self):
        Assessment.objects.create(child=self.child, psychologist=self.psy, questionnaire=self.qn, status="completed")
        self._auth("s@racco1.gov.ph")
        resp = self.client.get("/api/assessments/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)

    def test_result_included_in_list(self):
        self._auth("p@racco1.gov.ph")
        self.client.post("/api/assessments/", self._assessment_payload(), format="json")
        resp = self.client.get("/api/assessments/")
        self.assertIsNotNone(resp.data[0]["result"])
        self.assertIn("behavioral_score", resp.data[0]["result"])
        self.assertIn("notes", resp.data[0])
