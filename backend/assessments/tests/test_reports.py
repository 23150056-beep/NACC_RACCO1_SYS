from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from accounts.models import Role
from children.models import Child
from assessments.models import Assessment, AssessmentResult, Recommendation
from assessments.reports import trajectory

User = get_user_model()


class TrajectoryUnitTest(APITestCase):
    def test_baseline_with_fewer_than_two_scores(self):
        self.assertEqual(trajectory([]), "baseline")
        self.assertEqual(trajectory([50]), "baseline")
        self.assertEqual(trajectory([None, 50]), "baseline")

    def test_improving_when_latest_score_drops(self):
        self.assertEqual(trajectory([60, 50]), "improving")

    def test_worsening_when_latest_score_rises(self):
        self.assertEqual(trajectory([50, 60]), "worsening")

    def test_stable_within_band(self):
        self.assertEqual(trajectory([50, 53]), "stable")


def _result(a, score, cls, priority="Medium", conf=90):
    r = AssessmentResult.objects.create(
        assessment=a, behavioral_score=score, classification=cls,
        confidence=conf, assessment_date=a.assessment_date)
    Recommendation.objects.create(result=r, recommendation_text="x", priority_level=priority)
    return r


class ReportApiTest(APITestCase):
    def setUp(self):
        self.admin_role = Role.objects.create(role_name=Role.ADMINISTRATOR)
        self.psy_role = Role.objects.create(role_name=Role.PSYCHOLOGIST)
        self.staff_role = Role.objects.create(role_name=Role.STAFF)
        self.admin = User.objects.create_user(email="a@racco1.gov.ph", username="a", password="pass1234", role=self.admin_role)
        self.psy = User.objects.create_user(email="p@racco1.gov.ph", username="p", password="pass1234", role=self.psy_role)
        self.staff = User.objects.create_user(email="s@racco1.gov.ph", username="s", password="pass1234", role=self.staff_role)
        self.child = Child.objects.create(fullname="Ana", case_type="Foster Care", assigned_psychologist=self.psy)
        a1 = Assessment.objects.create(child=self.child, psychologist=self.psy, status="completed")
        _result(a1, 60, "Needs Counseling Attention", "High")
        a2 = Assessment.objects.create(child=self.child, psychologist=self.psy, status="completed")
        _result(a2, 50, "Needs Monitoring", "Medium")

    def _auth(self, email):
        token = self.client.post("/api/auth/login/", {"email": email, "password": "pass1234"}).data["access"]
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

    def test_child_report_returns_history_and_trajectory(self):
        self._auth("p@racco1.gov.ph")
        resp = self.client.get(f"/api/reports/child/{self.child.id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data["assessments"]), 2)
        self.assertEqual(resp.data["trajectory"], "improving")  # 60 -> 50

    def test_child_report_blocked_for_unassigned_psychologist(self):
        User.objects.create_user(email="o@racco1.gov.ph", username="o", password="pass1234", role=self.psy_role)
        self._auth("o@racco1.gov.ph")
        resp = self.client.get(f"/api/reports/child/{self.child.id}/")
        self.assertEqual(resp.status_code, 404)

    def test_summary_for_admin(self):
        self._auth("a@racco1.gov.ph")
        resp = self.client.get("/api/reports/summary/?range=monthly")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["total"], 2)
        self.assertEqual(resp.data["children"], 1)
        self.assertEqual(len(resp.data["attention"]), 0)  # latest is Needs Monitoring

    def test_summary_forbidden_for_psychologist(self):
        self._auth("p@racco1.gov.ph")
        self.assertEqual(self.client.get("/api/reports/summary/").status_code, 403)

    def test_summary_csv_download(self):
        self._auth("s@racco1.gov.ph")
        resp = self.client.get("/api/reports/summary/?export=csv")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp["Content-Type"], "text/csv")
        self.assertIn("Total assessments", resp.content.decode())


class AssessmentEditTest(APITestCase):
    def setUp(self):
        self.psy_role = Role.objects.create(role_name=Role.PSYCHOLOGIST)
        self.psy = User.objects.create_user(email="p@racco1.gov.ph", username="p", password="pass1234", role=self.psy_role)
        self.other = User.objects.create_user(email="o@racco1.gov.ph", username="o", password="pass1234", role=self.psy_role)
        self.child = Child.objects.create(fullname="Kid", assigned_psychologist=self.psy)
        self.a = Assessment.objects.create(
            child=self.child, psychologist=self.psy, status="completed",
            notes="orig", classification="Normal Development")

    def _auth(self, email):
        token = self.client.post("/api/auth/login/", {"email": email, "password": "pass1234"}).data["access"]
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + token)

    def test_owner_can_edit_notes_and_classification(self):
        self._auth("p@racco1.gov.ph")
        resp = self.client.patch(f"/api/assessments/{self.a.id}/", {
            "notes": "updated", "classification": "Adjustment Disorder"}, format="json")
        self.assertEqual(resp.status_code, 200)
        self.a.refresh_from_db()
        self.assertEqual(self.a.notes, "updated")
        self.assertEqual(self.a.classification, "Adjustment Disorder")

    def test_edit_logs_activity(self):
        from activity.models import ActivityLog
        self._auth("p@racco1.gov.ph")
        self.client.patch(f"/api/assessments/{self.a.id}/", {"notes": "x"}, format="json")
        self.assertTrue(ActivityLog.objects.filter(action="updated", entity_type="Assessment").exists())

    def test_non_owner_cannot_edit(self):
        self._auth("o@racco1.gov.ph")
        resp = self.client.patch(f"/api/assessments/{self.a.id}/", {"notes": "hack"}, format="json")
        self.assertIn(resp.status_code, (403, 404))

    def test_finalize_locks_and_blocks_further_edit(self):
        self._auth("p@racco1.gov.ph")
        fin = self.client.post(f"/api/assessments/{self.a.id}/finalize/")
        self.assertEqual(fin.status_code, 200)
        self.a.refresh_from_db()
        self.assertTrue(self.a.is_locked)
        resp = self.client.patch(f"/api/assessments/{self.a.id}/", {"notes": "late"}, format="json")
        self.assertEqual(resp.status_code, 400)
