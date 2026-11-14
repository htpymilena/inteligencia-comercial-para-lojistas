from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models import utcnow


class Recommendation(Base):
    __tablename__ = "recommendations"
    __table_args__ = (
        CheckConstraint("priority IN ('HIGH','MEDIUM','LOW')"),
        CheckConstraint("status IN ('PROPOSED','ACCEPTED','DISMISSED')"),
        CheckConstraint("generation_method = 'RULE_BASED_DEMO' AND data_origin = 'DEMO'"),
        CheckConstraint("length(title)>0 AND length(hypothesis)>0 AND length(evidence)>0"),
        Index("ix_recommendations_store_status_created", "store_id", "status", "created_at"),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    title: Mapped[str]
    hypothesis: Mapped[str]
    evidence: Mapped[str]
    priority: Mapped[str]
    status: Mapped[str] = mapped_column(default="PROPOSED")
    generation_method: Mapped[str] = mapped_column(default="RULE_BASED_DEMO")
    data_origin: Mapped[str] = mapped_column(default="DEMO")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    version: Mapped[int] = mapped_column(default=1)
