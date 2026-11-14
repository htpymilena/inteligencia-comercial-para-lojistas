from datetime import date

from sqlalchemy import func, select

from app.monitor_models import DemoCamera, HeatmapCell, MonitoringSnapshot
from app.seed_demo import STORE_IDS
from app.seed_monitoring import seed_monitoring
from tests.integration.test_identity import login


def test_monitoring_seed_and_empty(api_client, seeded_session):
    base = date(2026, 11, 14)
    seed_monitoring(seeded_session, base)
    seed_monitoring(seeded_session, base)
    assert seeded_session.scalar(select(func.count()).select_from(DemoCamera)) == 3
    assert seeded_session.scalar(select(func.count()).select_from(MonitoringSnapshot)) == 3
    assert seeded_session.scalar(select(func.count()).select_from(HeatmapCell)) == 3 * 7 * 80
    headers = login(api_client)
    url = f"/api/v1/stores/{STORE_IDS[0]}"
    response = api_client.get(url + "/heatmap/demo", params={"date": str(base)}, headers=headers)
    assert response.status_code == 200
    assert len(response.json()["cells"]) == 80
    empty = api_client.get(url + "/heatmap/demo", params={"date": "2000-01-01"}, headers=headers)
    assert empty.json()["cells"] == empty.json()["insights"] == []
    assert api_client.get(url + "/monitoring/demo", headers=headers).json()["is_simulated"]
    assert api_client.get(url + "/cameras", headers=headers).json()["data_origin"] == "DEMO"
    assert (
        api_client.get(f"/api/v1/stores/{STORE_IDS[1]}/zones", headers=headers).status_code == 403
    )


def test_absent_snapshot(api_client):
    headers = login(api_client)
    response = api_client.get(f"/api/v1/stores/{STORE_IDS[0]}/monitoring/demo", headers=headers)
    assert response.status_code == 404
