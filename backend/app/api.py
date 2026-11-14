from collections.abc import Iterator
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import dto
from app.core.errors import DomainError
from app.db.session import session_scope
from app.models import User
from app.repositories import IdentityRepository
from app.schemas import ApiError
from app.services.identity import IdentityService

router = APIRouter(prefix="/api/v1")
bearer = HTTPBearer(auto_error=False, scheme_name="BearerAuth")


def database(request: Request) -> Iterator[Session]:
    with session_scope(request.app.state.engine) as session:
        yield session


DB = Annotated[Session, Depends(database)]


def identity(request: Request, session: DB) -> IdentityService:
    return IdentityService(
        IdentityRepository(session), request.app.state.settings.jwt_secret.get_secret_value()
    )


Identity = Annotated[IdentityService, Depends(identity)]


def current_user(
    service: Identity,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> User:
    if credentials is None:
        raise DomainError(401, "UNAUTHORIZED", "Sessão inválida")
    return service.current_user(credentials.credentials)


CurrentUser = Annotated[User, Depends(current_user)]


def errors(*codes: int) -> dict[int | str, dict[str, object]]:
    return {code: {"model": ApiError} for code in codes}


@router.post(
    "/auth/login",
    operation_id="login",
    response_model=dto.LoginResponse,
    responses=errors(401, 422, 500),
    openapi_extra={"security": []},
)
def login(body: dto.LoginRequest, service: Identity) -> dto.LoginResponse:
    token, user = service.login(body.email, body.password)
    return dto.LoginResponse(
        access_token=token, token_type="bearer", user=dto.User.model_validate(user)
    )


@router.get(
    "/auth/me", operation_id="obterPerfil", response_model=dto.User, responses=errors(401, 500)
)
def profile(user: CurrentUser) -> dto.User:
    return dto.User.model_validate(user)


@router.get(
    "/stores",
    operation_id="listarLojas",
    response_model=dto.StoresResponse,
    responses=errors(401, 500),
)
def stores(user: CurrentUser, service: Identity) -> dto.StoresResponse:
    return dto.StoresResponse(
        items=[dto.Store.model_validate(s) for s in service.repository.stores(user)]
    )


@router.get(
    "/stores/{store_id}",
    operation_id="obterLoja",
    response_model=dto.Store,
    responses=errors(401, 403, 404, 422, 500),
)
def store(store_id: UUID, user: CurrentUser, service: Identity) -> dto.Store:
    return dto.Store.model_validate(service.require_store_access(user, store_id))
