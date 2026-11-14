import os
from datetime import date, timedelta
from decimal import Decimal
from uuid import NAMESPACE_URL, uuid5
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.metric_models import DailyMetric
from app.seed_demo import STORE_IDS
from app.services.metrics import money


def base_date() -> date:
    from datetime import datetime

    value = os.environ.get("DEMO_BASE_DATE")
    return (
        date.fromisoformat(value) if value else datetime.now(ZoneInfo("America/Araguaina")).date()
    )


def seed_metrics(session: Session, base: date) -> None:
    # Build and validate every value before any write/flush.
    records = []
    for shop, store_id in enumerate(STORE_IDS):
        for day in range(60):
            metric_date = base - timedelta(days=59 - day)
            sales = 5 + (day + shop) % 15
            records.append(
                DailyMetric(
                    id=uuid5(NAMESPACE_URL, f"nexo/metric/{store_id}/{metric_date}"),
                    store_id=store_id,
                    metric_date=metric_date,
                    visitor_count=50 + day * 2 + shop,
                    interaction_count=100 + day * 3,
                    sales_count=sales,
                    revenue_brl=money(Decimal(sales) * Decimal("19.90")),
                    data_origin="DEMO",
                )
            )
    for record in records:
        existing = session.scalar(
            select(DailyMetric).where(
                DailyMetric.store_id == record.store_id,
                DailyMetric.metric_date == record.metric_date,
            )
        )
        if existing is not None:
            if existing.data_origin != "DEMO" or existing.id != record.id:
                raise RuntimeError("Colisão de métricas; seed cancelada")
        else:
            session.add(record)
    session.flush()
