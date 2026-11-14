from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.report_dto import ComparativeReportResponse
from app.services.comparison import comparison
from app.services.metrics import MetricRepository, period


class ReportService:
    def __init__(self, session: Session) -> None:
        self.repository = MetricRepository(session)

    def summary(self, store: UUID, start: date, end: date) -> ComparativeReportResponse:
        before, last, days = period(start, end)
        payload = comparison(
            self.repository.totals(store, start, end),
            self.repository.totals(store, before, last),
            days,
        )
        return ComparativeReportResponse(
            store_id=store,
            period_start=start,
            period_end=end,
            baseline_start=before,
            baseline_end=last,
            **payload,
        )
