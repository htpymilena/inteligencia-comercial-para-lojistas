import os

import app.models  # noqa: F401
from alembic import context
from app.core.config import load_settings, validate_database_url
from app.db.base import Base
from app.db.session import build_engine

target_metadata = Base.metadata


def database_url():
    # Integration uses only TEST_DATABASE_URL, never a development fallback.
    if context.get_x_argument(as_dictionary=True).get("test") == "true":
        value = os.environ.get("TEST_DATABASE_URL")
        if not value:
            raise RuntimeError("TEST_DATABASE_URL obrigatória")
        return validate_database_url(value)
    return load_settings().database_url.get_secret_value()


if context.is_offline_mode():
    context.configure(url=database_url(), target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()
else:
    engine = build_engine(database_url())
    try:
        with engine.connect() as connection:
            context.configure(connection=connection, target_metadata=target_metadata)
            with context.begin_transaction():
                context.run_migrations()
    except Exception:
        raise RuntimeError("Falha SQL/Alembic; confira acesso ao banco configurado") from None
    finally:
        engine.dispose()
