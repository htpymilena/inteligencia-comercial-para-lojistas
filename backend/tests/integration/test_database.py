import os
import subprocess
import sys
from pathlib import Path
from uuid import uuid4

import pytest
from sqlalchemy import text

from app.core.config import validate_database_url
from app.db.session import build_engine, session_scope
from app.models import Store


def test_postgresql16_session_and_alembic():
    url = os.environ.get("TEST_DATABASE_URL")
    if not url:
        pytest.skip("PENDENTE 3.7: TEST_DATABASE_URL ausente; PostgreSQL 16 de teste necessário")
    # Deliberately no DATABASE_URL fallback and no SQLite substitution.
    validate_database_url(url)
    engine = build_engine(url)
    try:
        with engine.connect() as connection:
            version = int(connection.scalar(text("SHOW server_version_num")))
            assert 160000 <= version < 170000
            assert connection.scalar(text("SELECT 1")) == 1
        with session_scope(engine) as session:
            assert session.scalar(text("SELECT 1")) == 1
        with session_scope(engine) as session:
            assert session.scalar(text("SELECT 1")) == 1
        environment = os.environ.copy()
        environment.pop("DATABASE_URL", None)
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "-x", "test=true", "current"],
            cwd=Path(__file__).resolve().parents[2],
            env=environment,
            capture_output=True,
            text=True,
            timeout=30,
        )
        assert result.returncode == 0
        assert engine.pool.checkedout() == 0
    except Exception:
        pytest.fail("Falha SQL: confira PostgreSQL 16 e TEST_DATABASE_URL de teste", pytrace=False)
    finally:
        engine.dispose()


def test_session_scope_commits_rolls_back_and_returns_connection(migrated_engine):
    persisted_id, rejected_id = uuid4(), uuid4()
    with session_scope(migrated_engine) as session:
        session.add(Store(id=persisted_id, name="Lifecycle committed", segment="DEMO"))
    try:
        with session_scope(migrated_engine) as session:
            assert session.get(Store, persisted_id) is not None

        with pytest.raises(RuntimeError, match="rollback probe"):
            with session_scope(migrated_engine) as session:
                session.add(Store(id=rejected_id, name="Lifecycle rejected", segment="DEMO"))
                session.flush()
                raise RuntimeError("rollback probe")
        with session_scope(migrated_engine) as session:
            assert session.get(Store, rejected_id) is None
    finally:
        with session_scope(migrated_engine) as session:
            persisted = session.get(Store, persisted_id)
            if persisted is not None:
                session.delete(persisted)
    assert migrated_engine.pool.checkedout() == 0
