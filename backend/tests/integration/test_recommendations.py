from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import DomainError
from app.models import Store
from app.recommendation_models import Recommendation
from app.seed_demo import STORE_IDS
from app.seed_recommendations import seed_recommendations
from app.services.recommendations import RecommendationService
from tests.integration.test_identity import login


def test_recommendation_flow(api_client, seeded_session):
    seed_recommendations(seeded_session)
    headers = login(api_client)
    url = f"/api/v1/stores/{STORE_IDS[0]}/recommendations"
    result = api_client.get(url, headers=headers)
    assert result.status_code == 200 and len(result.json()["items"]) == 3
    resource = result.json()["items"][0]["id"]
    response = api_client.patch(url + f"/{resource}", headers=headers, json={"status": "ACCEPTED"})
    assert response.status_code == 200
    assert (
        api_client.patch(
            url + f"/{resource}", headers=headers, json={"status": "ACCEPTED"}
        ).status_code
        == 409
    )
    seed_recommendations(seeded_session)
    assert api_client.get(url, headers=headers, params={"status": "ACCEPTED"}).json()["items"]
    external = seeded_session.scalar(
        select(Recommendation.id).where(Recommendation.store_id == STORE_IDS[1])
    )
    assert (
        api_client.patch(
            url + f"/{external}", headers=headers, json={"status": "DISMISSED"}
        ).status_code
        == 404
    )


def test_concurrent_terminal_transition(migrated_engine):
    store, resource = uuid4(), uuid4()
    with Session(migrated_engine) as session:
        session.add(Store(id=store, name="Concorrência DEMO", segment="Teste", is_demo=True))
        session.flush()
        session.add(
            Recommendation(
                id=resource,
                store_id=store,
                title="DEMO",
                hypothesis="DEMO",
                evidence="DEMO",
                priority="HIGH",
            )
        )
        session.commit()
    barrier = Barrier(2)

    def execute(target):
        with Session(migrated_engine) as session:
            service = RecommendationService(session)
            row = service.repository.get(store, resource)
            assert row.status == "PROPOSED"
            barrier.wait(timeout=10)
            try:
                service.transition(store, resource, target)
                session.commit()
                return 200
            except DomainError as error:
                session.rollback()
                return error.status

    with ThreadPoolExecutor(max_workers=2) as pool:
        assert sorted(pool.map(execute, ("ACCEPTED", "DISMISSED"))) == [200, 409]
