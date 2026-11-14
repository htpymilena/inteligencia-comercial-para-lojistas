from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import load_settings
from app.core.security import decode_token, hash_password, issue_token, verify_password
from app.dto import LoginRequest
from app.main import create_app

KEY = "synthetic-only-signing-key-for-tests-32"


def test_hash_and_jwt():
    encoded = hash_password("synthetic-password")
    assert "synthetic-password" not in encoded
    assert verify_password("synthetic-password", encoded)
    assert not verify_password("wrong", encoded)
    user_id = uuid4()
    token = issue_token(user_id, "ADMIN", KEY)
    assert decode_token(token, KEY) == user_id
    claims = jwt.decode(token, KEY, algorithms=["HS256"])
    assert 1790 <= claims["exp"] - datetime.now(UTC).timestamp() <= 1800


@pytest.mark.parametrize(
    "claims",
    [
        {"sub": "invalid", "role": "ADMIN", "exp": 9999999999},
        {"sub": str(uuid4()), "role": "INVALID", "exp": 9999999999},
        {"sub": str(uuid4()), "role": "ADMIN"},
        {"sub": str(uuid4()), "role": "ADMIN", "exp": datetime.now(UTC) - timedelta(seconds=1)},
    ],
)
def test_reject_invalid_claims(claims):
    with pytest.raises(ValueError):
        decode_token(jwt.encode(claims, KEY, algorithm="HS256"), KEY)


def test_wrong_signature_and_algorithm():
    token = issue_token(uuid4(), "ADMIN", KEY)
    with pytest.raises(ValueError):
        decode_token(token, KEY + "wrong")
    token = jwt.encode(
        {"sub": str(uuid4()), "role": "ADMIN", "exp": 9999999999}, KEY, algorithm="HS384"
    )
    with pytest.raises(ValueError):
        decode_token(token, KEY)


def test_email_and_sanitized_errors(monkeypatch):
    assert (
        LoginRequest(email=" LOJISTA@demo.invalid ", password="x").email == "lojista@demo.invalid"
    )
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    with TestClient(create_app()) as client:
        response = client.post("/api/v1/auth/login", json={"email": "bad", "password": "hidden"})
        assert response.status_code == 422
        assert "hidden" not in response.text
        assert response.json()["request_id"] == response.headers["X-Request-ID"]
        assert client.get("/api/v1/auth/me").status_code == 401


def test_secret_configuration(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    monkeypatch.delenv("JWT_SECRET")
    with pytest.raises(RuntimeError, match="JWT_SECRET"):
        load_settings()
    monkeypatch.setenv("JWT_SECRET", "too-short")
    with pytest.raises(RuntimeError, match="JWT_SECRET"):
        load_settings()
