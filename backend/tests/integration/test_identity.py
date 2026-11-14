from pathlib import Path
from uuid import uuid4

import jsonschema
import pytest
import yaml
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError

from app.db.session import session_scope
from app.models import Store, User, UserStore
from app.seed_demo import STORE_IDS, USER_IDS, seed_identity

CONTRACT = yaml.safe_load(
    (Path(__file__).resolve().parents[3] / "sistema/openapi.yaml").read_text(encoding="utf-8")
)


def assert_contract_body(response, schema_name):
    schema = {**CONTRACT, "$ref": f"#/components/schemas/{schema_name}"}
    jsonschema.Draft202012Validator(schema).validate(response.json())


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
    assert api_client.get(f"/api/v1/stores/{uuid4()}", headers=admin).status_code == 404
    assert set(api_client.get(f"/api/v1/stores/{STORE_IDS[0]}", headers=admin).json()) == {
        "id", "name", "segment", "description", "is_demo"
    }
    assert api_client.get("/api/v1/stores").status_code == 401
    user = seeded_session.get(User, USER_IDS[1])
    user.is_active = False
    seeded_session.flush()
    assert api_client.get("/api/v1/auth/me", headers=headers).status_code == 401


def test_persisted_role_and_link_control_access(api_client, seeded_session, capsys):
    admin_headers = login(api_client, "admin")
    admin_user = seeded_session.get(User, USER_IDS[0])
    admin_user.role = "LOJISTA"
    seeded_session.flush()
    denied = api_client.get(f"/api/v1/stores/{STORE_IDS[1]}", headers=admin_headers)
    assert denied.status_code == 403
    assert "Loja Calçados" not in denied.text

    lojista_headers = login(api_client)
    linked = seeded_session.get(UserStore, (USER_IDS[1], STORE_IDS[0]))
    seeded_session.delete(linked)
    seeded_session.flush()
    assert api_client.get("/api/v1/stores", headers=lojista_headers).json() == {"items": []}
    denied = api_client.get(f"/api/v1/stores/{STORE_IDS[0]}", headers=lojista_headers)
    assert denied.status_code == 403
    assert "Loja Moda" not in denied.text
    assert api_client.get("/api/v1/stores").status_code == 401
    logs = capsys.readouterr().out
    assert "Loja Calçados" not in logs and "Loja Moda" not in logs


def test_bad_password_and_seed_idempotency(api_client, seeded_session):
    from tests.integration.conftest import PASSWORDS

    hashes = list(seeded_session.scalars(select(User.password_hash).order_by(User.id)))
    store_ids = set(seeded_session.scalars(select(Store.id)))
    user_ids = set(seeded_session.scalars(select(User.id)))
    links = set(seeded_session.execute(select(UserStore.user_id, UserStore.store_id)).all())
    seed_identity(seeded_session, PASSWORDS)
    assert seeded_session.scalar(select(func.count()).select_from(Store)) == 3
    assert seeded_session.scalar(select(func.count()).select_from(User)) == 2
    assert list(seeded_session.scalars(select(User.password_hash).order_by(User.id))) == hashes
    assert set(seeded_session.scalars(select(Store.id))) == store_ids == set(STORE_IDS)
    assert set(seeded_session.scalars(select(User.id))) == user_ids == set(USER_IDS)
    assert set(seeded_session.execute(select(UserStore.user_id, UserStore.store_id)).all()) == links
    response = api_client.post(
        "/api/v1/auth/login",
        json={
            "email": "lojista@demo.invalid",
            "password": "wrong",
        },
    )
    assert response.status_code == 401


def test_login_normalization_public_fields_and_rejections(api_client, seeded_session):
    valid = api_client.post(
        "/api/v1/auth/login",
        json={"email": " LOJISTA@demo.invalid ", "password": "synthetic-lojista-password"},
    )
    assert valid.status_code == 200
    assert set(valid.json()) == {"access_token", "token_type", "user"}
    assert set(valid.json()["user"]) == {"id", "email", "display_name", "role"}
    assert valid.json()["user"]["email"] == "lojista@demo.invalid"
    assert api_client.get("/api/v1/auth/me").status_code == 401

    wrong = api_client.post(
        "/api/v1/auth/login",
        json={"email": "lojista@demo.invalid", "password": "wrong"},
    )
    missing = api_client.post(
        "/api/v1/auth/login",
        json={"email": "missing@demo.invalid", "password": "wrong"},
    )
    assert wrong.status_code == missing.status_code == 401
    assert wrong.json()["error"] == missing.json()["error"]
    user = seeded_session.get(User, USER_IDS[1])
    user.is_active = False
    seeded_session.flush()
    inactive = api_client.post(
        "/api/v1/auth/login",
        json={"email": "lojista@demo.invalid", "password": "synthetic-lojista-password"},
    )
    assert inactive.status_code == 401


def test_removed_user_token_is_rejected(api_client, seeded_session):
    headers = login(api_client, "admin")
    user = seeded_session.get(User, USER_IDS[0])
    seeded_session.delete(user)
    seeded_session.flush()
    assert api_client.get("/api/v1/auth/me", headers=headers).status_code == 401


def test_m01_real_http_bodies_match_normative_schemas(api_client):
    login_response = api_client.post(
        "/api/v1/auth/login",
        json={"email": "lojista@demo.invalid", "password": "synthetic-lojista-password"},
    )
    assert login_response.status_code == 200
    assert_contract_body(login_response, "LoginResponse")
    headers = {"Authorization": "Bearer " + login_response.json()["access_token"]}
    for path, schema_name in (
        ("/api/v1/auth/me", "User"),
        ("/api/v1/stores", "StoresResponse"),
        (f"/api/v1/stores/{STORE_IDS[0]}", "Store"),
    ):
        response = api_client.get(path, headers=headers)
        assert response.status_code == 200
        assert_contract_body(response, schema_name)
    for response, status in (
        (api_client.get("/api/v1/stores"), 401),
        (api_client.get(f"/api/v1/stores/{STORE_IDS[1]}", headers=headers), 403),
        (api_client.get("/api/v1/stores/not-a-uuid", headers=headers), 422),
        (api_client.post("/api/v1/auth/login", json={"email": "bad", "password": "x"}), 422),
        (api_client.get(f"/api/v1/stores/{uuid4()}", headers=login(api_client, "admin")), 404),
    ):
        assert response.status_code == status
        assert_contract_body(response, "ApiError")


def test_seed_collision(sql_session):
    from tests.integration.conftest import PASSWORDS

    sql_session.add(Store(id=STORE_IDS[0], name="External", segment="External", is_demo=False))
    sql_session.flush()
    with pytest.raises(RuntimeError, match="externo"):
        seed_identity(sql_session, PASSWORDS)
    assert sql_session.get(Store, STORE_IDS[0]).name == "External"


def test_seed_late_collision_rolls_back_all_writes(migrated_engine):
    from tests.integration.conftest import PASSWORDS

    with session_scope(migrated_engine) as session:
        session.add(
            Store(id=STORE_IDS[1], name="External", segment="External", is_demo=False)
        )
    try:
        with pytest.raises(RuntimeError, match="externo"):
            with session_scope(migrated_engine) as session:
                seed_identity(session, PASSWORDS)
        with session_scope(migrated_engine) as session:
            assert session.get(Store, STORE_IDS[0]) is None
            assert session.get(Store, STORE_IDS[1]).name == "External"
            assert session.scalar(select(func.count()).select_from(User)) == 0
    finally:
        with session_scope(migrated_engine) as session:
            external = session.get(Store, STORE_IDS[1])
            if external is not None:
                session.delete(external)


def test_identity_constraints_in_postgresql(migrated_engine):
    statement = text("""
        INSERT INTO users (id, email, password_hash, display_name, role, is_active, created_at)
        VALUES (:id, :email, 'synthetic-hash', 'Test', :role, true, now())
    """)
    with migrated_engine.connect() as connection:
        transaction = connection.begin()
        try:
            for email, role in (
                ("UPPER@demo.invalid", "ADMIN"),
                ("valid@demo.invalid", "INVALID"),
            ):
                with pytest.raises(IntegrityError):
                    with connection.begin_nested():
                        connection.execute(
                            statement, {"id": uuid4(), "email": email, "role": role}
                        )
            connection.execute(
                statement, {"id": uuid4(), "email": "unique@demo.invalid", "role": "ADMIN"}
            )
            with pytest.raises(IntegrityError):
                with connection.begin_nested():
                    connection.execute(
                        statement,
                        {"id": uuid4(), "email": "unique@demo.invalid", "role": "ADMIN"},
                    )
            with pytest.raises(IntegrityError):
                with connection.begin_nested():
                    connection.execute(
                        text("INSERT INTO user_stores (user_id, store_id) VALUES (:u, :s)"),
                        {"u": uuid4(), "s": uuid4()},
                    )
            column_type = connection.scalar(text("""
                SELECT data_type FROM information_schema.columns
                WHERE table_schema = current_schema() AND table_name = 'users'
                  AND column_name = 'created_at'
            """))
            assert column_type == "timestamp with time zone"
        finally:
            transaction.rollback()
