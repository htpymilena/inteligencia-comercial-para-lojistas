from pydantic import PostgresDsn, SecretStr, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(hide_input_in_errors=True, env_file=None)

    database_url: SecretStr


def validate_database_url(value: str) -> str:
    """Validate without including credentials in diagnostics."""
    from pydantic import TypeAdapter

    try:
        url = TypeAdapter(PostgresDsn).validate_python(value)
        if url.scheme != "postgresql+psycopg":
            raise ValueError
    except (ValidationError, ValueError):
        raise RuntimeError("DATABASE_URL deve usar postgresql+psycopg e ser válida") from None
    return value


def load_settings() -> Settings:
    try:
        settings = Settings()
    except ValidationError as exc:
        fields = sorted({str(error["loc"][0]).upper() for error in exc.errors()})
        raise RuntimeError(
            "Configuração obrigatória ausente/inválida: " + ", ".join(fields)
        ) from None
    validate_database_url(settings.database_url.get_secret_value())
    return settings
