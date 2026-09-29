import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import engine, Base
from backend.migrations import run_migrations
from backend.ai.extractor import extract_location_from_text, extract_time_from_text
from backend.ai.classifier import classifier, WEATHER_CATEGORIES

class TestAIPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        run_migrations()
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def test_01_classifier_metrics(self):
        r = self.client.get('/api/ai/metrics')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("accuracy", data)
        self.assertIn("f1_weighted", data)
        self.assertEqual(data["categories_count"], 8)
        print("Test 1 Passed: Classifier metrics verified. Accuracy:", data["accuracy"], "F1:", data["f1_weighted"])

    def test_02_location_ner_extraction(self):
        text = "Severe waterlogging and knee-deep inundation reported near Patia, Bhubaneswar at 10:30 IST"
        loc = extract_location_from_text(text)
        self.assertEqual(loc.get("city"), "Bhubaneswar")
        self.assertEqual(loc.get("place_name"), "Patia")
        self.assertEqual(loc.get("state"), "Odisha")
        self.assertAlmostEqual(loc.get("latitude"), 20.3588, places=2)
        self.assertAlmostEqual(loc.get("longitude"), 85.8164, places=2)

        t = extract_time_from_text(text)
        self.assertIn("10:30", t.get("extracted_time_str"))
        print("Test 2 Passed: Location & Time NER exact extraction verified.")

    def test_03_report_ai_processing_and_persistence(self):
        events_res = self.client.get('/api/events?limit=3')
        self.assertEqual(events_res.status_code, 200)
        events = events_res.json()
        self.assertGreater(len(events), 0)
        first_id = events[0]['id']

        r = self.client.post(f'/api/ai/process/{first_id}')
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertIn(res['classification']['predicted_category'], WEATHER_CATEGORIES)
        self.assertGreater(res['classification']['confidence'], 0.0)
        self.assertIn(res['evidence_assistance']['evidence_status'], ['supporting', 'conflicting', 'insufficient'])
        print(f"Test 3 Passed: Report {first_id} processed by AI. Category: {res['classification']['predicted_category']}, Evidence: {res['evidence_assistance']['evidence_status']}")

    def test_04_ai_analysis_endpoint(self):
        events_res = self.client.get('/api/events?limit=1')
        first_id = events_res.json()[0]['id']
        r = self.client.get(f'/api/ai/analysis/{first_id}')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data['report_id'], first_id)
        self.assertIn('probabilities', data['classification'])
        print("Test 4 Passed: GET /api/ai/analysis verified.")

    def test_05_related_and_evidence_endpoints(self):
        events_res = self.client.get('/api/events?limit=1')
        first_id = events_res.json()[0]['id']

        # Related
        r_rel = self.client.get(f'/api/ai/related/{first_id}')
        self.assertEqual(r_rel.status_code, 200)
        self.assertIn('related_reports', r_rel.json())

        # Evidence
        r_ev = self.client.get(f'/api/ai/evidence/{first_id}')
        self.assertEqual(r_ev.status_code, 200)
        self.assertIn('evidence_status', r_ev.json())
        print("Test 5 Passed: GET /api/ai/related and GET /api/ai/evidence verified.")

    def test_06_human_verification_action(self):
        events_res = self.client.get('/api/events?limit=1')
        first_id = events_res.json()[0]['id']

        payload = {
            "new_status": "under_review",
            "reviewer_name": "Senior Meteorologist Dr. R. Sen",
            "notes": "Corroborated with regional synoptic radar. Scheduled for field station review."
        }
        r = self.client.post(f'/api/ai/verify/{first_id}', json=payload)
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertEqual(res['new_status'], 'under_review')

        # Check updated report
        r_chk = self.client.get(f'/api/events/{first_id}')
        self.assertEqual(r_chk.json()['status'], 'under_review')
        print("Test 6 Passed: Human Reviewer verification workflow and history persistence verified.")

if __name__ == '__main__':
    unittest.main()
