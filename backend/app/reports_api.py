from datetime import date
from uuid import UUID

from fastapi import APIRouter

from app.api import DB, CurrentUser, Identity, errors
from app.report_dto import ComparativeReportResponse
from app.services.reports import ReportService

router = APIRouter(prefix="/api/v1/stores/{store_id}/reports")


@router.get(
    "/summary",
    operation_id="obterRelatorioComparativo",
    response_model=ComparativeReportResponse,
    responses=errors(401, 403, 404, 422, 500),
)
def summary(
    store_id: UUID,
    period_start: date,
    period_end: date,
    user: CurrentUser,
    identity: Identity,
    session: DB,
) -> ComparativeReportResponse:
    identity.require_store_access(user, store_id)
    return ReportService(session).summary(store_id, period_start, period_end)
