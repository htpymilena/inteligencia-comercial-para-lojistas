from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models import utcnow


class Experiment(Base):
    __tablename__ = "experiments"
    __table_args__ = (
        CheckConstraint("status IN ('DRAFT','RUNNING','COMPLETED','CANCELLED')"),
        CheckConstraint("metric IN ('VISITORS','SALES','REVENUE','CONVERSION')"),
        CheckConstraint("start_date <= end_date"),
        CheckConstraint("length(title) BETWEEN 3 AND 140"),
        Index("ix_experiments_store_created", "store_id", "created_at"),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    recommendation_id: Mapped[UUID] = mapped_column(ForeignKey("recommendations.id"))
    title: Mapped[str]
    metric: Mapped[str]
    start_date: Mapped[date]
    end_date: Mapped[date]
    status: Mapped[str] = mapped_column(default="DRAFT")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    version: Mapped[int] = mapped_column(default=1)
