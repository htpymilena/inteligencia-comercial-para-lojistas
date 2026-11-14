from uuid import UUID

from fastapi import APIRouter, Query

from app import circuit_dto as dto
from app.api import DB, CurrentUser, Identity, errors
from app.core.errors import DomainError
from app.services.circuits import CircuitRepository, to_dto

router = APIRouter(prefix="/api/v1/circuits", tags=["Circuits"])


@router.get(
    "",
    operation_id="listarCircuitos",
    response_model=dto.CircuitListResponse,
    responses=errors(401, 403, 422, 500),
    openapi_extra={"x-mvp-module": "M07"},
)
def listing(
    user: CurrentUser,
    identity: Identity,
    session: DB,
    store_id: UUID = Query(default=None),
) -> dto.CircuitListResponse:
    repo = CircuitRepository(session)
    circuits = repo.listing()

    if store_id is not None:
        identity.require_store_access(user, store_id)
        target = str(store_id)
        filtered = [c for c in circuits if target in c.store_ids]
    elif user.role == "ADMIN":
        filtered = circuits
    else:
        user_stores = {str(s.id) for s in identity.repository.stores(user)}
        filtered = [c for c in circuits if any(s in user_stores for s in c.store_ids)]

    return dto.CircuitListResponse(items=[to_dto(c) for c in filtered])


@router.post(
    "",
    operation_id="criarCircuito",
    status_code=201,
    response_model=dto.Circuit,
    responses=errors(401, 403, 409, 422, 500),
    openapi_extra={"x-mvp-module": "M07"},
)
def create(
    body: dto.CircuitCreateRequest,
    user: CurrentUser,
    identity: Identity,
    session: DB,
) -> dto.Circuit:
    if user.role != "ADMIN":
        raise DomainError(403, "FORBIDDEN", "Apenas administradores podem cadastrar circuitos")
    row = CircuitRepository(session).create(body)
    return to_dto(row)


@router.get(
    "/{circuit_id}",
    operation_id="obterCircuito",
    response_model=dto.Circuit,
    responses=errors(401, 403, 404, 422, 500),
    openapi_extra={"x-mvp-module": "M07"},
)
def detail(
    circuit_id: UUID,
    user: CurrentUser,
    identity: Identity,
    session: DB,
) -> dto.Circuit:
    row = CircuitRepository(session).get(circuit_id)
    if row is None:
        raise DomainError(404, "NOT_FOUND", "Circuito não encontrado")
    if user.role != "ADMIN":
        user_stores = {str(s.id) for s in identity.repository.stores(user)}
        if not any(s in user_stores for s in row.store_ids):
            raise DomainError(403, "FORBIDDEN", "Acesso não autorizado ao circuito")
    return to_dto(row)


@router.patch(
    "/{circuit_id}/status",
    operation_id="alterarStatusCircuito",
    response_model=dto.Circuit,
    responses=errors(401, 403, 404, 409, 422, 500),
    openapi_extra={"x-mvp-module": "M07"},
)
def transition(
    circuit_id: UUID,
    body: dto.CircuitStatusUpdateRequest,
    user: CurrentUser,
    identity: Identity,
    session: DB,
) -> dto.Circuit:
    if user.role != "ADMIN":
        raise DomainError(403, "FORBIDDEN", "Apenas administradores podem alterar o status do circuito")
    repo = CircuitRepository(session)
    row = repo.get(circuit_id)
    if row is None:
        raise DomainError(404, "NOT_FOUND", "Circuito não encontrado")
    updated = repo.update_status(row, body.status)
    return to_dto(updated)


@router.get(
    "/{circuit_id}/stats",
    operation_id="obterEstatisticasCircuito",
    response_model=dto.CircuitStatsResponse,
    responses=errors(401, 403, 404, 422, 500),
    openapi_extra={"x-mvp-module": "M07"},
)
def stats(
    circuit_id: UUID,
    user: CurrentUser,
    identity: Identity,
    session: DB,
) -> dto.CircuitStatsResponse:
    row = CircuitRepository(session).get(circuit_id)
    if row is None:
        raise DomainError(404, "NOT_FOUND", "Circuito não encontrado")
    if user.role != "ADMIN":
        user_stores = {str(s.id) for s in identity.repository.stores(user)}
        if not any(s in user_stores for s in row.store_ids):
            raise DomainError(403, "FORBIDDEN", "Acesso não autorizado ao circuito")

    count = 58 if row.status == "ACTIVE" else (142 if row.status == "FINISHED" else 0)
    return dto.CircuitStatsResponse(
        circuit_id=row.id,
        data_origin="DEMO",
        period_start=row.start_date,
        period_end=row.end_date,
        completed_count=count,
    )
