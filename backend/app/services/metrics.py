from dataclasses import dataclass
from datetime import date, timedelta
from decimal import ROUND_HALF_UP, Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import DomainError
from app.metric_models import DailyMetric

CENT = Decimal("0.01")


def money(value: Decimal) -> Decimal:
    if not value.is_finite() or value < 0 or value > Decimal("999999999999.99"):
        raise ValueError("Receita inválida")
    if value != value.quantize(CENT):
        raise ValueError("Precisão financeira inválida")
    return value.quantize(CENT)


def rounded(value: Decimal) -> float:
    return float(value.quantize(CENT, rounding=ROUND_HALF_UP))


def ratio(numerator: int | Decimal, denominator: int | Decimal) -> float | None:
    return rounded(Decimal(numerator) / Decimal(denominator) * 100) if denominator else None


def change(current: int | Decimal, baseline: int | Decimal) -> float | None:
    return ratio(current - baseline, baseline) if baseline > 0 else None


def period(start: date, end: date, *, limit: bool = True) -> tuple[date, date, int]:
    days = (end - start).days + 1
    if days < 1 or (limit and days > 366):
        raise DomainError(422, "VALIDATION_ERROR", "Período inválido")
    try:
        return start - timedelta(days=days), start - timedelta(days=1), days
    except OverflowError:
        raise DomainError(422, "VALIDATION_ERROR", "Período fora dos limites") from None


@dataclass(frozen=True)
class Totals:
    visitors: int
    interactions: int
    sales: int
    revenue: Decimal
    days: int

    def payload(self) -> dict[str, Any]:
        return {
            "visitors": self.visitors,
            "interactions": self.interactions,
            "sales_count": self.sales,
            "revenue_brl": format(self.revenue, ".2f"),
            "conversion_rate": ratio(self.sales, self.visitors),
        }


def differences(current: Totals, baseline: Totals) -> dict[str, float | None]:
    # Difference uses exact rates before rounding the final result.
    pp = None
    if current.visitors and baseline.visitors:
        pp = rounded(
            (
                Decimal(current.sales) / current.visitors
                - Decimal(baseline.sales) / baseline.visitors
            )
            * 100
        )
    return {
        "visitor_change_percent": change(current.visitors, baseline.visitors),
        "interaction_change_percent": change(current.interactions, baseline.interactions),
        "sales_change_percent": change(current.sales, baseline.sales),
        "revenue_change_percent": change(current.revenue, baseline.revenue),
        "conversion_change_pp": pp,
    }


class MetricRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def rows(self, store_id: UUID, start: date, end: date) -> list[DailyMetric]:
        return list(
            self.session.scalars(
                select(DailyMetric)
                .where(
                    DailyMetric.store_id == store_id,
                    DailyMetric.metric_date.between(start, end),
                )
                .order_by(DailyMetric.metric_date)
            )
        )

    def totals(self, store_id: UUID, start: date, end: date) -> Totals:
        row = self.session.execute(
            select(
                func.coalesce(func.sum(DailyMetric.visitor_count), 0),
                func.coalesce(func.sum(DailyMetric.interaction_count), 0),
                func.coalesce(func.sum(DailyMetric.sales_count), 0),
                func.coalesce(func.sum(DailyMetric.revenue_brl), 0),
                func.count(DailyMetric.metric_date),
            ).where(DailyMetric.store_id == store_id, DailyMetric.metric_date.between(start, end))
        ).one()
        return Totals(int(row[0]), int(row[1]), int(row[2]), Decimal(row[3]), int(row[4]))
