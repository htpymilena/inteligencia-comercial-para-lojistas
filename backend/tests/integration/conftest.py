import os
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from alembic import command
from alembic.config import Config
from app.api import database
from app.db.session import build_engine
from app.main import create_app
from app.seed_demo import seed_identity

PASSWORDS = ("synthetic-admin-password", "synthetic-lojista-password")


@pytest.fixture(scope="session")
def migrated_engine():
    value = os.environ.get("TEST_DATABASE_URL")
    if not value:
        pytest.skip("TEST_DATABASE_URL ausente; integração PostgreSQL 16 não executada")
    base = build_engine(value)
    schema = "nexo_test_" + uuid4().hex
    try:
        with base.begin() as connection:
            version = int(connection.scalar(text("SHOW server_version_num")))
            assert 160000 <= version < 170000
            connection.execute(text(f'CREATE SCHEMA "{schema}"'))
    except Exception:
        pytest.fail(
            "PostgreSQL 16 indisponível ou sem permissão para schema isolado", pytrace=False
        )
    finally:
        base.dispose()
    url = make_url(value)
    query = dict(url.query)
    query["options"] = f"-csearch_path={schema}"
    isolated = url.set(query=query).render_as_string(hide_password=False)
    # A temporary environment override is restored without printing the URL.
    original = os.environ.get("TEST_DATABASE_URL")
    os.environ["TEST_DATABASE_URL"] = isolated
    config = Config(str(Path(__file__).resolve().parents[2] / "alembic.ini"))
    config.cmd_opts = type("Options", (), {"x": ["test=true"]})()
    try:
        command.upgrade(config, "head")
        command.current(config)
    finally:
        if original is not None:
            os.environ["TEST_DATABASE_URL"] = original
    engine = build_engine(isolated)
    print(f"Schema exclusivo preservado para inspeção: {schema}")
    yield engine
    engine.dispose()  # Deliberately no DROP SCHEMA or database reset.


@pytest.fixture
def sql_session(migrated_engine):
    with migrated_engine.connect() as connection:
        transaction = connection.begin()
        with Session(bind=connection, join_transaction_mode="create_savepoint") as session:
            yield session
        transaction.rollback()


@pytest.fixture
def seeded_session(sql_session):
    seed_identity(sql_session, PASSWORDS)
    sql_session.commit()
    return sql_session


@pytest.fixture
def api_client(seeded_session, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    app = create_app()

    def override():
        yield seeded_session
        seeded_session.commit()

    app.dependency_overrides[database] = override
    with TestClient(app) as client:
        yield client
