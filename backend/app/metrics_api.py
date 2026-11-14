from datetime import date
from uuid import UUID

from fastapi import APIRouter

from app.api import DB, CurrentUser, Identity, errors
from app.metric_dto import DailyMetric, DailyMetricsResponse, DashboardSummary
from app.services.metrics import MetricRepository, change, period, ratio

router = APIRouter(prefix="/api/v1/stores/{store_id}")


@router.get(
    "/dashboard",
    operation_id="obterDashboard",
    response_model=DashboardSummary,
    responses=errors(401, 403, 404, 422, 500),
)
def dashboard(
    store_id: UUID,
    period_start: date,
    period_end: date,
    user: CurrentUser,
    identity: Identity,
    session: DB,
) -> DashboardSummary:
    identity.require_store_access(user, store_id)
    before, last, _ = period(period_start, period_end)
    repository = MetricRepository(session)
    current = repository.totals(store_id, period_start, period_end)
    previous = repository.totals(store_id, before, last)
    return DashboardSummary(
        store_id=store_id,
        period_start=period_start,
        period_end=period_end,
        data_origin="DEMO",
        **current.payload(),
        visitor_change_percent=change(current.visitors, previous.visitors),
        sales_change_percent=change(current.sales, previous.sales),
    )


@router.get(
    "/metrics/daily",
    operation_id="listarMetricasDiarias",
    response_model=DailyMetricsResponse,
    responses=errors(401, 403, 404, 422, 500),
)
def daily(
    store_id: UUID,
    period_start: date,
    period_end: date,
    user: CurrentUser,
    identity: Identity,
    session: DB,
) -> DailyMetricsResponse:
    identity.require_store_access(user, store_id)
    period(period_start, period_end)
    rows = MetricRepository(session).rows(store_id, period_start, period_end)
    return DailyMetricsResponse(
        store_id=store_id,
        period_start=period_start,
        period_end=period_end,
        data_origin="DEMO",
        items=[
            DailyMetric(
                date=r.metric_date,
                visitor_count=r.visitor_count,
                interaction_count=r.interaction_count,
                sales_count=r.sales_count,
                revenue_brl=format(r.revenue_brl, ".2f"),
                conversion_rate=ratio(r.sales_count, r.visitor_count),
            )
            for r in rows
        ],
    )
