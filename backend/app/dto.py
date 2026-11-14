from typing import Annotated, Literal
from uuid import UUID

from email_validator import EmailNotValidError, validate_email
from pydantic import AfterValidator, BaseModel, ConfigDict, Field


def email_address(value: str) -> str:
    value = value.strip().lower()
    # Reserved demo.invalid is intentional; validate syntax without DNS lookups.
    candidate = value[:-8] + ".test" if value.endswith(".invalid") else value
    try:
        validate_email(candidate, check_deliverability=False, test_environment=True)
    except EmailNotValidError:
        raise ValueError("Email inválido") from None
    return value


Email = Annotated[str, Field(json_schema_extra={"format": "email"}), AfterValidator(email_address)]


class DTO(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)


class User(DTO):
    id: UUID
    email: Email
    display_name: str = Field(min_length=1)
    role: Literal["ADMIN", "LOJISTA"]


class LoginRequest(DTO):
    email: Email
    password: str = Field(min_length=1)


class LoginResponse(DTO):
    access_token: str = Field(min_length=10)
    token_type: Literal["bearer"]
    user: User


class Store(DTO):
    id: UUID
    name: str = Field(min_length=1)
    segment: str = Field(min_length=1)
    description: str | None
    is_demo: bool


class StoresResponse(DTO):
    items: list[Store]
