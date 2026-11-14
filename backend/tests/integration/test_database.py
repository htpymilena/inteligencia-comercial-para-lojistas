import os
import subprocess
import sys
from pathlib import Path

import pytest
from sqlalchemy import text

from app.core.config import validate_database_url
from app.db.session import build_engine, session_scope


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
