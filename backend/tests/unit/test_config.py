import pytest
from fastapi.testclient import TestClient

from app.main import create_app

TEST_URL = "postgresql+psycopg://test:sentinel-secret@127.0.0.1:1/nexo_test"


def test_valid_startup(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", TEST_URL)
    with TestClient(create_app()) as client:
        assert client.get("/openapi.json").status_code == 200


def test_missing_configuration(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    with pytest.raises(RuntimeError, match="DATABASE_URL") as error:
        with TestClient(create_app()):
            pass
    assert "sentinel-secret" not in str(error.value)


@pytest.mark.parametrize(
    "url", ["sqlite:///secret", "postgresql://user:secret@localhost/db", "secret"]
)
def test_invalid_configuration_is_sanitized(monkeypatch, url):
    monkeypatch.setenv("DATABASE_URL", url)
    with pytest.raises(RuntimeError, match="DATABASE_URL") as error:
        with TestClient(create_app()):
            pass
    assert "secret" not in str(error.value)
