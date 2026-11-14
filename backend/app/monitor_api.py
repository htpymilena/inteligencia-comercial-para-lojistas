from datetime import date as Date
from uuid import UUID

from fastapi import APIRouter

from app import monitor_dto as dto
from app.api import DB, CurrentUser, Identity, errors
from app.services.monitoring import MonitoringService

router = APIRouter(prefix="/api/v1/stores/{store_id}")


@router.get(
    "/cameras",
    operation_id="listarCamerasDemo",
    response_model=dto.CameraListResponse,
    responses=errors(401, 403, 404, 422, 500),
)
def cameras(
    store_id: UUID, user: CurrentUser, identity: Identity, session: DB
) -> dto.CameraListResponse:
    identity.require_store_access(user, store_id)
    return MonitoringService(session).cameras(store_id)


@router.get(
    "/monitoring/demo",
    operation_id="obterMonitoramentoDemo",
    response_model=dto.MonitoringDemoResponse,
    responses=errors(401, 403, 404, 422, 500),
)
def snapshot(
    store_id: UUID, user: CurrentUser, identity: Identity, session: DB
) -> dto.MonitoringDemoResponse:
    identity.require_store_access(user, store_id)
    return MonitoringService(session).snapshot(store_id)


@router.get(
    "/zones",
    operation_id="listarZonas",
    response_model=dto.ZoneListResponse,
    responses=errors(401, 403, 404, 422, 500),
)
def zones(
    store_id: UUID, user: CurrentUser, identity: Identity, session: DB
) -> dto.ZoneListResponse:
    identity.require_store_access(user, store_id)
    return MonitoringService(session).zones(store_id)


@router.get(
    "/heatmap/demo",
    operation_id="obterMapaCalorDemo",
    response_model=dto.HeatmapDemoResponse,
    responses=errors(401, 403, 404, 422, 500),
)
def heatmap(
    store_id: UUID, date: Date, user: CurrentUser, identity: Identity, session: DB
) -> dto.HeatmapDemoResponse:
    identity.require_store_access(user, store_id)
    return MonitoringService(session).heatmap(store_id, date)
