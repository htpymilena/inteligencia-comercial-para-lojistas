from uuid import UUID

from fastapi import APIRouter, Query

from app import recommendation_dto as dto
from app.api import DB, CurrentUser, Identity, errors
from app.services.recommendations import RecommendationRepository, RecommendationService

router = APIRouter(prefix="/api/v1/stores/{store_id}/recommendations")


@router.get(
    "",
    operation_id="listarRecomendacoes",
    response_model=dto.RecommendationListResponse,
    responses=errors(401, 403, 404, 422, 500),
)
def listing(
    store_id: UUID,
    user: CurrentUser,
    identity: Identity,
    session: DB,
    status: dto.RecommendationStatus = Query(default=None),
) -> dto.RecommendationListResponse:
    identity.require_store_access(user, store_id)
    rows = RecommendationRepository(session).listing(store_id, status)
    return dto.RecommendationListResponse(
        items=[dto.Recommendation.model_validate(r) for r in rows], data_origin="DEMO"
    )


@router.patch(
    "/{recommendation_id}",
    operation_id="atualizarRecomendacao",
    response_model=dto.Recommendation,
    responses=errors(401, 403, 404, 409, 422, 500),
)
def transition(
    store_id: UUID,
    recommendation_id: UUID,
    body: dto.RecommendationUpdateRequest,
    user: CurrentUser,
    identity: Identity,
    session: DB,
) -> dto.Recommendation:
    identity.require_store_access(user, store_id)
    return dto.Recommendation.model_validate(
        RecommendationService(session).transition(store_id, recommendation_id, body.status)
    )
