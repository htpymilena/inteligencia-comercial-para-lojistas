from datetime import date

from app.seed_demo import STORE_IDS
from app.seed_metrics import seed_metrics
from tests.integration.test_identity import login


def test_report_api(api_client, seeded_session):
    seed_metrics(seeded_session, date(2026, 11, 14))
    headers = login(api_client)
    path = f"/api/v1/stores/{STORE_IDS[0]}/reports/summary"
    query = {"period_start": "2026-11-10", "period_end": "2026-11-12"}
    response = api_client.get(path, headers=headers, params=query)
    assert response.status_code == 200 and response.json()["available"]
    assert response.json()["baseline_start"] == "2026-11-07"
    assert response.json()["baseline_end"] == "2026-11-09"
    empty = api_client.get(
        path, headers=headers, params={"period_start": "2000-01-01", "period_end": "2000-01-03"}
    )
    assert not empty.json()["available"]
    assert empty.json()["baseline"] is empty.json()["current"] is empty.json()["changes"] is None
    assert (
        api_client.get(
            f"/api/v1/stores/{STORE_IDS[1]}/reports/summary", headers=headers, params=query
        ).status_code
        == 403
    )
