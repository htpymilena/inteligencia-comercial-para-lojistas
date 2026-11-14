from datetime import date

from app.seed_demo import STORE_IDS
from app.seed_metrics import seed_metrics
from app.seed_recommendations import seed_recommendations
from tests.integration.test_identity import login


def test_experiment_lifecycle(api_client, seeded_session):
    seed_recommendations(seeded_session)
    seed_metrics(seeded_session, date(2026, 11, 14))
    headers = login(api_client)
    root = f"/api/v1/stores/{STORE_IDS[0]}"
    recommendation = api_client.get(root + "/recommendations", headers=headers).json()["items"][0][
        "id"
    ]
    body = {
        "recommendation_id": recommendation,
        "title": "Experimento DEMO",
        "metric": "SALES",
        "start_date": "2026-11-10",
        "end_date": "2026-11-12",
    }
    assert api_client.post(root + "/experiments", headers=headers, json=body).status_code == 409
    assert (
        api_client.patch(
            root + "/recommendations/" + recommendation,
            headers=headers,
            json={"status": "ACCEPTED"},
        ).status_code
        == 200
    )
    result = api_client.post(root + "/experiments", headers=headers, json=body)
    assert result.status_code == 201
    path = root + "/experiments/" + result.json()["id"]
    assert api_client.get(path + "/result", headers=headers).json()["available"] is False
    assert (
        api_client.patch(
            path + "/status", headers=headers, json={"status": "COMPLETED"}
        ).status_code
        == 409
    )
    for status in ("RUNNING", "COMPLETED"):
        assert (
            api_client.patch(path + "/status", headers=headers, json={"status": status}).status_code
            == 200
        )
    assert api_client.get(path + "/result", headers=headers).json()["available"] is True
