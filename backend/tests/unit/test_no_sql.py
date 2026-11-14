import importlib

from fastapi.testclient import TestClient
from sqlalchemy.engine import Engine

from app.db.base import Base
from app.db.session import build_engine


def test_import_and_http_do_not_connect(monkeypatch):
    def forbidden(*args, **kwargs):
        raise AssertionError("HTTP não deve abrir conexão SQL")

    monkeypatch.setattr(Engine, "connect", forbidden)
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    module = importlib.reload(importlib.import_module("app.main"))
    with TestClient(module.create_app()) as client:
        assert client.get("/health").status_code == 200
    assert {"users", "stores", "user_stores"} <= set(Base.metadata.tables)
    engine = build_engine("postgresql+psycopg://test:test@127.0.0.1:1/test")
    engine.dispose()


def test_application_disposes_engine_on_shutdown(monkeypatch):
    from app import main

    class FakeEngine:
        disposed = False

        def dispose(self):
            self.disposed = True

    engine = FakeEngine()
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    monkeypatch.setattr(main, "build_engine", lambda _url: engine)
    with TestClient(main.create_app()) as client:
        assert client.get("/health").status_code == 200
        assert not engine.disposed
    assert engine.disposed
