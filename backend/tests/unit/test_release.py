from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import jwt
import pytest
from fastapi.testclient import TestClient

from alembic import command
from alembic.config import Config
from app.api import current_user, database, identity
from app.core.errors import DomainError
from app.core.security import decode_token
from app.main import create_app
from app.seed_demo import demo_passwords
from app.services.identity import IdentityService


def test_access_checked_before_store_query():
    class Repository:
        def linked(self, user, store):
            return False

        def store(self, store):
            raise AssertionError("Loja externa não deve ser consultada")

    service = IdentityService(Repository(), "synthetic")
    with pytest.raises(DomainError) as error:
        service.require_store_access(SimpleNamespace(id=uuid4(), role="LOJISTA"), uuid4())
    assert error.value.status == 403


def test_seed_configuration_before_writes(monkeypatch):
    monkeypatch.delenv("DEMO_ADMIN_PASSWORD", raising=False)
    monkeypatch.delenv("DEMO_LOJISTA_PASSWORD", raising=False)
    with pytest.raises(RuntimeError, match="DEMO_ADMIN_PASSWORD"):
        demo_passwords()


def test_signed_infinite_expiry_is_unauthorized():
    key = "synthetic-key-with-at-least-32-bytes"
    token = jwt.encode({"sub": str(uuid4()), "role": "ADMIN", "exp": float("inf")}, key)
    with pytest.raises(ValueError, match="Token inválido"):
        decode_token(token, key)


def test_persisted_role_is_authority_after_token_issue():
    from app.core.security import issue_token

    key = "synthetic-key-with-at-least-32-bytes"
    user_id = uuid4()
    stored = SimpleNamespace(id=user_id, role="LOJISTA", is_active=True)

    class Repository:
        def user(self, resource):
            assert resource == user_id
            return stored

        def linked(self, *args):
            return False

    service = IdentityService(Repository(), key)
    user = service.current_user(issue_token(user_id, "ADMIN", key))
    assert user.role == "LOJISTA"
    with pytest.raises(DomainError) as error:
        service.require_store_access(user, uuid4())
    assert error.value.status == 403


def test_all_store_operations_enforce_policy_before_sql(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    app = create_app()
    user = SimpleNamespace(id=uuid4(), role="LOJISTA")

    class Denied:
        def require_store_access(self, *args):
            raise DomainError(403, "FORBIDDEN", "Acesso não autorizado à loja")

    def no_database():
        yield None  # No engine or SQL; controllers must reject before domain queries.

    app.dependency_overrides[database] = no_database
    app.dependency_overrides[current_user] = lambda: user
    app.dependency_overrides[identity] = lambda: Denied()
    with TestClient(app) as client:
        spec = client.get("/openapi.json").json()
        for path, operations in spec["paths"].items():
            if "{store_id}" not in path:
                continue
            concrete = (
                path.replace("{store_id}", str(uuid4()))
                .replace("{recommendation_id}", str(uuid4()))
                .replace("{experiment_id}", str(uuid4()))
            )
            for method in operations:
                body = None
                if method == "post":
                    body = {
                        "recommendation_id": str(uuid4()),
                        "title": "DEMO test",
                        "metric": "SALES",
                        "start_date": "2026-11-10",
                        "end_date": "2026-11-12",
                    }
                elif method == "patch":
                    body = {"status": "ACCEPTED" if "recommendations" in path else "RUNNING"}
                response = client.request(
                    method.upper(),
                    concrete,
                    json=body,
                    params={
                        "period_start": "2026-11-10",
                        "period_end": "2026-11-12",
                        "date": "2026-11-10",
                    },
                )
                assert response.status_code == 403, (method, path, response.text)
                assert response.json()["request_id"] == response.headers["X-Request-ID"]


def test_migration_chain_compiles_without_sql(monkeypatch):
    import io

    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    root = Path(__file__).resolve().parents[2]
    stream = io.StringIO()
    config = Config(str(root / "alembic.ini"), output_buffer=stream)
    command.upgrade(config, "head", sql=True)
    sql = stream.getvalue()
    for table in (
        "users",
        "stores",
        "user_stores",
        "daily_metrics",
        "demo_cameras",
        "store_zones",
        "heatmap_cells",
        "monitoring_snapshots",
        "recommendations",
        "experiments",
    ):
        assert f"CREATE TABLE {table}" in sql
    assert "DROP TABLE" not in sql
    # Reverse SQL is inspected only; never applied to a database.
    reverse = io.StringIO()
    config = Config(str(root / "alembic.ini"), output_buffer=reverse)
    command.downgrade(config, "005:base", sql=True)
    assert "DROP TABLE experiments" in reverse.getvalue()
