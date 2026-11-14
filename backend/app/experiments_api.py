from uuid import UUID

from fastapi import APIRouter

from app import experiment_dto as dto
from app.api import DB, CurrentUser, Identity, errors
from app.services.experiments import ExperimentRepository, ExperimentService

router = APIRouter(prefix="/api/v1/stores/{store_id}/experiments")


@router.get(
    "",
    operation_id="listarExperimentos",
    response_model=dto.ExperimentListResponse,
    responses=errors(401, 403, 404, 422, 500),
)
def listing(
    store_id: UUID, user: CurrentUser, identity: Identity, session: DB
) -> dto.ExperimentListResponse:
    identity.require_store_access(user, store_id)
    return dto.ExperimentListResponse(
        items=[
            dto.Experiment.model_validate(r)
            for r in ExperimentRepository(session).listing(store_id)
        ]
    )


@router.post(
    "",
    operation_id="criarExperimento",
    status_code=201,
    response_model=dto.Experiment,
    responses=errors(401, 403, 404, 409, 422, 500),
)
def create(
    store_id: UUID,
    body: dto.ExperimentCreateRequest,
    user: CurrentUser,
    identity: Identity,
    session: DB,
) -> dto.Experiment:
    identity.require_store_access(user, store_id)
    return dto.Experiment.model_validate(ExperimentService(session).create(store_id, body))


@router.get(
    "/{experiment_id}",
    operation_id="obterExperimento",
    response_model=dto.Experiment,
    responses=errors(401, 403, 404, 422, 500),
)
def detail(
    store_id: UUID, experiment_id: UUID, user: CurrentUser, identity: Identity, session: DB
) -> dto.Experiment:
    identity.require_store_access(user, store_id)
    return dto.Experiment.model_validate(ExperimentService(session).get(store_id, experiment_id))


@router.patch(
    "/{experiment_id}/status",
    operation_id="alterarStatusExperimento",
    response_model=dto.Experiment,
    responses=errors(401, 403, 404, 409, 422, 500),
)
def transition(
    store_id: UUID,
    experiment_id: UUID,
    body: dto.ExperimentStatusUpdateRequest,
    user: CurrentUser,
    identity: Identity,
    session: DB,
) -> dto.Experiment:
    identity.require_store_access(user, store_id)
    return dto.Experiment.model_validate(
        ExperimentService(session).transition(store_id, experiment_id, body.status)
    )


@router.get(
    "/{experiment_id}/result",
    operation_id="obterResultadoExperimento",
    response_model=dto.ExperimentResultResponse,
    responses=errors(401, 403, 404, 422, 500),
)
def result(
    store_id: UUID, experiment_id: UUID, user: CurrentUser, identity: Identity, session: DB
) -> dto.ExperimentResultResponse:
    identity.require_store_access(user, store_id)
    return ExperimentService(session).result(store_id, experiment_id)
