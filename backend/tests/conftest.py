import pytest


@pytest.fixture(autouse=True)
def synthetic_jwt_secret(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "test-only-synthetic-signing-key-32-bytes")
