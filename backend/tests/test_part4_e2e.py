"""
End-to-End Integration and Verification Test Suite for Part 4
National Weather Intelligence Platform for India (SIH 2026)

Tests the complete lifecycle:
1. Health & Core Ingestion Queries
2. Citizen Weather Report Ingestion & Automated AI Analysis
3. Role-Based Access Control (Authentication & Token Issuance)
4. Administrative Review Queue Querying & Priority Filtering
5. Human Verification Decision Execution & Audit Trail
6. Incident Deduplication & Report Merging
7. Macro Weather Analytics Aggregation
"""

import sys
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal
from backend.models import WeatherReport, AIAnalysisRecord, VerificationHistoryRecord, EventGroup

client = TestClient(app)

def test_full_part4_e2e_workflow():
    print("\n=======================================================")
    print("  RUNNING PART 4 END-TO-END VERIFICATION TEST SUITE   ")
    print("=======================================================")

    # Step 1: Health & Startup Check
    print("\n[Step 1] Verifying System Health & Database Connection...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    assert health_data["status"] == "healthy"
    assert health_data["database"] == "connected"
    print(f" -> Health OK! Status: {health_data['status']}, Database: {health_data['database']}")

    # Step 2: Citizen Ingestion & AI Pipeline Trigger
    print("\n[Step 2] Ingesting New Citizen Weather Report (Ground Observation)...")
    payload = {
        "title": "Severe Flash Flooding & Road Inundation in Cuttack",
        "category": "Flooding",
        "severity": "critical",
        "description": "Continuous cloudburst rainfall since 3 PM has inundated Badambadi bus stand and Ring Road. Water level over 3 feet.",
        "state": "Odisha",
        "district": "Cuttack",
        "locationName": "Badambadi Bus Stand, Cuttack",
        "latitude": 20.4625,
        "longitude": 85.8830,
        "reporterName": "Subhashree Mohanty",
        "reporterContact": "+91-9876543210",
        "mediaFileUrl": "https://example.com/reports/cuttack_flood.jpg"
    }
    res = client.post("/api/reports/citizen", json=payload)
    assert res.status_code == 200, f"Citizen report submission failed: {res.text}"
    created_event = res.json()
    report_id = created_event["id"]
    print(f" -> Citizen Report created with ID: {report_id}")
    assert created_event["status"] == "pending_review"

    # Step 3: Verify AI Analysis Record Generated
    print("\n[Step 3] Checking AI Pipeline Automated Processing...")
    res = client.get(f"/api/ai/analysis/{report_id}")
    assert res.status_code == 200, f"Failed to retrieve AI analysis: {res.text}"
    ai_data = res.json()
    assert ai_data["report_id"] == report_id
    cat = ai_data["classification"]["predicted_category"]
    conf = ai_data["classification"]["confidence"]
    assert cat in ["Flooding", "Rainfall"]
    print(f" -> AI Predicted Category: {cat} (Conf: {conf})")
    print(f" -> Deduplication: {ai_data['deduplication']['duplicate_status']}")

    # Step 4: Test RBAC Authentication
    print("\n[Step 4] Testing Role-Based Authentication...")
    # Unauthorized attempt
    bad_login = client.post("/api/auth/login", json={"email": "hacker@domain.com", "password": "wrong"})
    assert bad_login.status_code == 401, "Expected 401 on invalid login"

    # Reviewer Login
    rev_res = client.post("/api/auth/login", json={"email": "reviewer@sih.gov.in", "password": "Reviewer@2026"})
    assert rev_res.status_code == 200, f"Reviewer login failed: {rev_res.text}"
    reviewer_token = rev_res.json()["token"]
    reviewer_headers = {"Authorization": f"Bearer {reviewer_token}"}
    print(" -> Reviewer Auth Token issued successfully.")

    # Admin Login
    adm_res = client.post("/api/auth/login", json={"email": "admin@sih.gov.in", "password": "Admin@2026"})
    assert adm_res.status_code == 200, f"Admin login failed: {adm_res.text}"
    admin_token = adm_res.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(" -> Chief Admin Auth Token issued successfully.")

    # Step 5: Test Admin Stats & Review Queue
    print("\n[Step 5] Accessing Protected Admin Review Queue...")
    # Protected endpoint without token should fail
    unauth_stats = client.get("/api/admin/dashboard-stats")
    assert unauth_stats.status_code in [401, 403], "Expected auth block on protected route"

    # With Reviewer token
    stats_res = client.get("/api/admin/dashboard-stats", headers=reviewer_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()["stats"]
    print(f" -> Admin Stats: Total={stats['total_reports']}, Pending={stats['pending_reports']}, Urgent={stats['urgent_priority']}")

    # Query Review Queue
    queue_res = client.get("/api/admin/review-queue?status=pending_review", headers=reviewer_headers)
    assert queue_res.status_code == 200
    queue = queue_res.json()
    print(f" -> Pending Review Queue matched items: {queue['total_matched']}")
    matching_item = next((i for i in queue["items"] if i["id"] == report_id), None)
    assert matching_item is not None, "Newly created citizen report not found in pending review queue!"
    print(f" -> Found Report {report_id} in queue with AI Priority: {matching_item['ai']['risk_priority']}")

    # Step 6: Execute Human Verification Decision
    print("\n[Step 6] Executing Human Review Decision (Verify & Publish)...")
    action_payload = {
        "report_id": report_id,
        "action": "verify",
        "notes": "Verified by Weather Officer: Inundation confirmed via local IMD Doppler radar and civic water logging alerts."
    }
    action_res = client.post("/api/admin/action", json=action_payload, headers=reviewer_headers)
    assert action_res.status_code == 200, f"Admin action failed: {action_res.text}"
    action_result = action_res.json()
    assert action_result["status"] == "success"
    assert action_result["new_status"] == "verified"
    print(f" -> Human verification signed! Status changed from {action_result['previous_status']} to {action_result['new_status']}")

    # Verify audit history logged
    db = SessionLocal()
    history = db.query(VerificationHistoryRecord).filter(VerificationHistoryRecord.report_id == report_id).first()
    assert history is not None
    assert history.new_status == "verified"
    assert "Verified by Weather Officer" in history.notes
    db.close()
    print(f" -> Audit log entry confirmed in database (Officer: {history.reviewer_name}).")

    # Step 7: Test Duplicate Incident Consolidation (Admin Role)
    print("\n[Step 7] Testing Duplicate Incident Clustering & Merging...")
    # Create secondary duplicate report
    dup_payload = {
        "title": "Badambadi ring road waterlogged",
        "category": "Flooding",
        "severity": "severe",
        "description": "Traffic halted near bus stand due to deep water.",
        "state": "Odisha",
        "district": "Cuttack",
        "locationName": "Cuttack Ring Road",
        "latitude": 20.4630,
        "longitude": 85.8840,
        "reporterName": "Citizen B",
        "reporterContact": "+91-9123456780"
    }
    dup_res = client.post("/api/reports/citizen", json=dup_payload)
    dup_id = dup_res.json()["id"]

    # Merge duplicate into primary report
    merge_payload = {
        "primary_report_id": report_id,
        "target_report_ids": [dup_id],
        "group_title": "Cuttack Urban Inundation Cluster",
        "notes": "Merged localized reports into single district incident cluster"
    }
    merge_res = client.post("/api/admin/merge-reports", json=merge_payload, headers=admin_headers)
    assert merge_res.status_code == 200, f"Merge failed: {merge_res.text}"
    merge_info = merge_res.json()
    assert merge_info["merged_reports_count"] == 2
    print(f" -> Duplicate report {dup_id} successfully merged into Event Group: {merge_info['event_group_id']}")

    # Step 8: Validate Macro Analytics Aggregation
    print("\n[Step 8] Verifying Real-Time Macro Analytics Calculations...")
    analytics_res = client.get("/api/analytics/summary")
    assert analytics_res.status_code == 200, f"Analytics failed: {analytics_res.text}"
    analytics_data = analytics_res.json()
    assert analytics_data["total_events"] >= 2000
    assert len(analytics_data["categories"]) > 0
    assert len(analytics_data["top_states"]) > 0
    assert "meteorological_extremes" in analytics_data
    print(f" -> Macro Analytics verified: {analytics_data['total_events']} events, {len(analytics_data['categories'])} categories, {len(analytics_data['top_states'])} states.")
    print(f" -> Max Recorded Precipitation: {analytics_data['meteorological_extremes']['max_precipitation_mm']} mm")

    print("\n=======================================================")
    print("  ALL PART 4 END-TO-END TESTS PASSED (100% SUCCESS)    ")
    print("=======================================================\n")

if __name__ == "__main__":
    test_full_part4_e2e_workflow()
