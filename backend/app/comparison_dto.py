from app.dto import DTO
from app.metric_dto import Money, Nonnegative, Rate


class MetricTotals(DTO):
    visitors: Nonnegative
    interactions: Nonnegative
    sales_count: Nonnegative
    revenue_brl: Money
    conversion_rate: Rate | None


class MetricChanges(DTO):
    visitor_change_percent: float | None
    interaction_change_percent: float | None
    sales_change_percent: float | None
    revenue_change_percent: float | None
    conversion_change_pp: float | None
