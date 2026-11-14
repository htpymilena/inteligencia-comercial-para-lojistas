"""Explicit, transactional demo data. Never runs at application startup."""

import os
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import load_settings
from app.core.security import hash_password, verify_password
from app.db.session import build_engine, session_scope
from app.models import Store, User, UserStore

STORE_IDS = [UUID(f"00000000-0000-4000-8000-{i:012d}") for i in (1, 2, 3)]
USER_IDS = [UUID(f"00000000-0000-4000-8000-{i:012d}") for i in (101, 102)]


def demo_passwords() -> tuple[str, str]:
    values = []
    for name in ("DEMO_ADMIN_PASSWORD", "DEMO_LOJISTA_PASSWORD"):
        value = os.environ.get(name)
        if not value:
            raise RuntimeError(f"Configuração obrigatória: {name}")
        values.append(value)
    return values[0], values[1]


def seed_identity(session: Session, passwords: tuple[str, str]) -> None:
    for store_id, name, segment in zip(
        STORE_IDS,
        ("Loja Moda", "Loja Calçados", "Loja Acessórios"),
        ("Roupas", "Calçados", "Acessórios"),
        strict=True,
    ):
        store = session.get(Store, store_id)
        if store is not None:
            if not store.is_demo or store.name != name or store.segment != segment:
                raise RuntimeError("Colisão com registro externo; seed cancelada")
        else:
            session.add(
                Store(
                    id=store_id,
                    name=name,
                    segment=segment,
                    description="Loja fictícia DEMO",
                    is_demo=True,
                )
            )
    for user_id, role, password in zip(USER_IDS, ("ADMIN", "LOJISTA"), passwords, strict=True):
        email = f"{role.lower()}@demo.invalid"
        user = session.scalar(select(User).where((User.id == user_id) | (User.email == email)))
        if user is not None:
            if (
                user.id != user_id
                or user.email != email
                or user.role != role
                or user.display_name != f"{role} DEMO"
                or not verify_password(password, user.password_hash)
            ):
                raise RuntimeError("Colisão de identidade; seed não redefine contas")
        else:
            session.add(
                User(
                    id=user_id,
                    email=email,
                    role=role,
                    display_name=f"{role} DEMO",
                    password_hash=hash_password(password),
                    is_active=True,
                )
            )
    session.flush()
    if session.get(UserStore, (USER_IDS[1], STORE_IDS[0])) is None:
        session.add(UserStore(user_id=USER_IDS[1], store_id=STORE_IDS[0]))
    session.flush()


def main() -> None:
    passwords = demo_passwords()  # Validate before opening a write transaction.
    engine = build_engine(load_settings().database_url.get_secret_value())
    try:
        with session_scope(engine) as session:
            seed_identity(session, passwords)
    except Exception:
        raise RuntimeError("Seed não concluída; confira configuração e colisões") from None
    finally:
        engine.dispose()


if __name__ == "__main__":
    main()
