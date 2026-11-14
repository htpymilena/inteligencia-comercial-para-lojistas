import pytest
from sqlalchemy import func, select

from app.models import Store, User
from app.seed_demo import STORE_IDS, USER_IDS, seed_identity


def login(client, role="lojista"):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": f"{role}@demo.invalid",
            "password": f"synthetic-{role}-password",
        },
    )
    assert response.status_code == 200
    return {"Authorization": "Bearer " + response.json()["access_token"]}


def test_identity_flow_and_access(api_client, seeded_session):
    headers = login(api_client)
    assert api_client.get("/api/v1/auth/me", headers=headers).json()["role"] == "LOJISTA"
    assert len(api_client.get("/api/v1/stores", headers=headers).json()["items"]) == 1
    assert api_client.get(f"/api/v1/stores/{STORE_IDS[0]}", headers=headers).status_code == 200
    assert api_client.get(f"/api/v1/stores/{STORE_IDS[1]}", headers=headers).status_code == 403
    assert api_client.get("/api/v1/stores/not-uuid", headers=headers).status_code == 422
    admin = login(api_client, "admin")
    assert len(api_client.get("/api/v1/stores", headers=admin).json()["items"]) == 3
    user = seeded_session.get(User, USER_IDS[1])
    user.is_active = False
    seeded_session.flush()
    assert api_client.get("/api/v1/auth/me", headers=headers).status_code == 401


def test_bad_password_and_seed_idempotency(api_client, seeded_session):
    from tests.integration.conftest import PASSWORDS

    hashes = list(seeded_session.scalars(select(User.password_hash).order_by(User.id)))
    seed_identity(seeded_session, PASSWORDS)
    assert seeded_session.scalar(select(func.count()).select_from(Store)) == 3
    assert seeded_session.scalar(select(func.count()).select_from(User)) == 2
    assert list(seeded_session.scalars(select(User.password_hash).order_by(User.id))) == hashes
    response = api_client.post(
        "/api/v1/auth/login",
        json={
            "email": "lojista@demo.invalid",
            "password": "wrong",
        },
    )
    assert response.status_code == 401


def test_seed_collision(sql_session):
    from tests.integration.conftest import PASSWORDS

    sql_session.add(Store(id=STORE_IDS[0], name="External", segment="External", is_demo=False))
    sql_session.flush()
    with pytest.raises(RuntimeError, match="externo"):
        seed_identity(sql_session, PASSWORDS)
    assert sql_session.get(Store, STORE_IDS[0]).name == "External"
