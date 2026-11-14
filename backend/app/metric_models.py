from datetime import date
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, Date, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DailyMetric(Base):
    __tablename__ = "daily_metrics"
    __table_args__ = (
        UniqueConstraint("store_id", "metric_date"),
        CheckConstraint("visitor_count >= 0 AND interaction_count >= 0 AND sales_count >= 0"),
        CheckConstraint("revenue_brl >= 0 AND revenue_brl != 'NaN'::numeric"),
        CheckConstraint("data_origin = 'DEMO'"),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    metric_date: Mapped[date] = mapped_column(Date)
    visitor_count: Mapped[int]
    interaction_count: Mapped[int]
    sales_count: Mapped[int]
    revenue_brl: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    data_origin: Mapped[str] = mapped_column(String, default="DEMO")
