from datetime import date
from typing import Literal
from uuid import UUID

from app.comparison_dto import MetricChanges, MetricTotals
from app.dto import DTO


class ComparativeReportResponse(DTO):
    store_id: UUID
    period_start: date
    period_end: date
    baseline_start: date
    baseline_end: date
    available: bool
    reason: str | None
    data_origin: Literal["DEMO"]
    baseline: MetricTotals | None
    current: MetricTotals | None
    changes: MetricChanges | None
    disclaimer: str
