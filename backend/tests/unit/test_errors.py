import json

from fastapi.routing import APIRoute
from fastapi.testclient import TestClient

from app.main import create_app


def test_internal_error_and_sanitized_logs(monkeypatch, caplog):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:secret@127.0.0.1:1/test")
    app = create_app()

    async def fail(request):
        raise RuntimeError("SELECT secret FROM users; postgresql://user:secret@db/test")

    route = next(r for r in app.routes if isinstance(r, APIRoute) and r.path == "/health")
    route.app = fail
    with TestClient(app) as client, caplog.at_level("INFO", logger="nexo.http"):
        response = client.get(
            "/health?password=secret",
            headers={"Authorization": "Bearer secret", "X-Request-ID": "secret"},
        )
    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": "INTERNAL_ERROR", "message": "Erro interno do serviço", "details": None},
        "request_id": response.headers["X-Request-ID"],
    }
    records = [json.loads(r.message) for r in caplog.records if r.name == "nexo.http"]
    assert len(records) == 1
    assert records[0]["route"] == "/health"
    assert records[0]["method"] == "GET"
    assert records[0]["status"] == 500
    assert records[0]["duration_ms"] >= 0
    assert records[0]["request_id"] == response.json()["request_id"]
    for forbidden in ("secret", "SELECT", "RuntimeError", "Traceback", "postgresql"):
        assert forbidden not in response.text + caplog.text


def test_success_is_logged(monkeypatch, caplog):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    with TestClient(create_app()) as client, caplog.at_level("INFO", logger="nexo.http"):
        response = client.get("/health")
    record = json.loads(next(r.message for r in caplog.records if r.name == "nexo.http"))
    assert record["status"] == 200
    assert record["request_id"] == response.headers["X-Request-ID"]
