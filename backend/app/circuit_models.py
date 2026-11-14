from datetime import date, datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models import utcnow


class Circuit(Base):
    __tablename__ = "circuits"
    __table_args__ = (
        CheckConstraint("status IN ('DRAFT','ACTIVE','FINISHED','CANCELLED')"),
        CheckConstraint("start_date <= end_date"),
        CheckConstraint("length(name) BETWEEN 1 AND 140"),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String)
    reward_description: Mapped[str] = mapped_column(String)
    start_date: Mapped[date]
    end_date: Mapped[date]
    status: Mapped[str] = mapped_column(default="DRAFT")
    store_ids: Mapped[list[Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
