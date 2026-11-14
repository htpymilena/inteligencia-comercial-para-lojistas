from datetime import UTC, datetime, timedelta
from uuid import UUID

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

hasher = PasswordHasher()
dummy_hash = hasher.hash("synthetic-dummy-verification-only")


def hash_password(password: str) -> str:
    return hasher.hash(password)


def verify_password(password: str, encoded: str) -> bool:
    try:
        return hasher.verify(encoded, password)
    except (VerificationError, InvalidHashError):
        return False


def issue_token(user_id: UUID, role: str, secret: str) -> str:
    return jwt.encode(
        {"sub": str(user_id), "role": role, "exp": datetime.now(UTC) + timedelta(minutes=30)},
        secret,
        algorithm="HS256",
    )


def decode_token(token: str, secret: str) -> UUID:
    try:
        claims = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={
                "require": ["sub", "role", "exp"],
            },
        )
        if claims["role"] not in ("ADMIN", "LOJISTA"):
            raise ValueError
        return UUID(claims["sub"])
    except (jwt.InvalidTokenError, ValueError, TypeError, KeyError):
        raise ValueError("Token inválido") from None
