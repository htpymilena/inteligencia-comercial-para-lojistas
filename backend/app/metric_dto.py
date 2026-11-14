from datetime import date
from typing import Annotated, Literal
from uuid import UUID

from pydantic import Field

from app.dto import DTO

Money = Annotated[str, Field(pattern=r"^\d+\.\d{2}$")]
Nonnegative = Annotated[int, Field(ge=0)]
Rate = Annotated[float, Field(ge=0)]


class DashboardSummary(DTO):
    store_id: UUID
    period_start: date
    period_end: date
    data_origin: Literal["DEMO"]
    visitors: Nonnegative
    interactions: Nonnegative
    sales_count: Nonnegative
    revenue_brl: Money
    conversion_rate: Rate | None
    visitor_change_percent: float | None
    sales_change_percent: float | None


class DailyMetric(DTO):
    date: date
    visitor_count: Nonnegative
    interaction_count: Nonnegative
    sales_count: Nonnegative
    revenue_brl: Money
    conversion_rate: Rate | None


class DailyMetricsResponse(DTO):
    store_id: UUID
    period_start: date
    period_end: date
    data_origin: Literal["DEMO"]
    items: list[DailyMetric]
