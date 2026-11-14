from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DemoCamera(Base):
    __tablename__ = "demo_cameras"
    __table_args__ = (
        CheckConstraint("is_simulated = true"),
        CheckConstraint("status IN ('SIMULATED_ON','SIMULATED_OFF')"),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    name: Mapped[str]
    placement: Mapped[str]
    status: Mapped[str]
    is_simulated: Mapped[bool]


class StoreZone(Base):
    __tablename__ = "store_zones"
    __table_args__ = (
        UniqueConstraint("store_id", "name"),
        CheckConstraint(
            "grid_x >= 0 AND grid_y >= 0 AND grid_width >= 1 AND grid_height >= 1"
            " AND grid_x + grid_width <= 10 AND grid_y + grid_height <= 8"
        ),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    name: Mapped[str]
    grid_x: Mapped[int]
    grid_y: Mapped[int]
    grid_width: Mapped[int]
    grid_height: Mapped[int]


class HeatmapCell(Base):
    __tablename__ = "heatmap_cells"
    __table_args__ = (
        UniqueConstraint("store_id", "metric_date", "grid_x", "grid_y"),
        CheckConstraint("grid_x BETWEEN 0 AND 9 AND grid_y BETWEEN 0 AND 7"),
        CheckConstraint("intensity BETWEEN 0 AND 1"),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    metric_date: Mapped[date]
    grid_x: Mapped[int]
    grid_y: Mapped[int]
    intensity: Mapped[Decimal] = mapped_column(Numeric(4, 3))


class MonitoringSnapshot(Base):
    __tablename__ = "monitoring_snapshots"
    __table_args__ = (
        CheckConstraint("people_now >= 0 AND entries_today >= 0 AND exits_today >= 0"),
        CheckConstraint("data_origin = 'DEMO'"),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    people_now: Mapped[int]
    entries_today: Mapped[int]
    exits_today: Mapped[int]
    zone_occupancy: Mapped[list[dict[str, Any]]] = mapped_column(JSONB)
    data_origin: Mapped[str]
