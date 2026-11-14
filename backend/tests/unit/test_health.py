from fastapi.testclient import TestClient

from app.main import create_app


def test_public_health(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    with TestClient(create_app()) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "service": "nexo-api"}
        assert response.headers["content-type"] == "application/json"
