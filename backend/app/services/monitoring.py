from datetime import date
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import monitor_dto as dto
from app.core.errors import DomainError
from app.monitor_models import DemoCamera, HeatmapCell, MonitoringSnapshot, StoreZone


class MonitoringService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def cameras(self, store: UUID) -> dto.CameraListResponse:
        rows = self.session.scalars(
            select(DemoCamera).where(DemoCamera.store_id == store).order_by(DemoCamera.id)
        )
        return dto.CameraListResponse(
            items=[dto.CameraDemo.model_validate(r) for r in rows], data_origin="DEMO"
        )

    def zones(self, store: UUID) -> dto.ZoneListResponse:
        rows = self.session.scalars(
            select(StoreZone).where(StoreZone.store_id == store).order_by(StoreZone.id)
        )
        return dto.ZoneListResponse(
            items=[dto.StoreZone.model_validate(r) for r in rows], data_origin="DEMO"
        )

    def snapshot(self, store: UUID) -> dto.MonitoringDemoResponse:
        row = self.session.scalar(
            select(MonitoringSnapshot)
            .where(MonitoringSnapshot.store_id == store)
            .order_by(MonitoringSnapshot.captured_at.desc(), MonitoringSnapshot.id)
            .limit(1)
        )
        if row is None:
            raise DomainError(404, "NOT_FOUND", "Snapshot DEMO não encontrado")
        valid_zones = {z.id for z in self.zones(store).items}
        zones = [dto.ZoneOccupancy.model_validate(z) for z in row.zone_occupancy]
        if any(z.zone_id not in valid_zones for z in zones):
            raise RuntimeError("Snapshot inválido")
        return dto.MonitoringDemoResponse(
            store_id=store,
            is_simulated=True,
            data_origin="DEMO",
            snapshot_at=row.captured_at,
            people_now=row.people_now,
            entries_today=row.entries_today,
            exits_today=row.exits_today,
            zones=zones,
        )

    def heatmap(self, store: UUID, day: date) -> dto.HeatmapDemoResponse:
        rows = self.session.scalars(
            select(HeatmapCell)
            .where(
                HeatmapCell.store_id == store,
                HeatmapCell.metric_date == day,
            )
            .order_by(HeatmapCell.grid_y, HeatmapCell.grid_x)
        )
        cells = [dto.HeatmapCell.model_validate(r) for r in rows]
        return dto.HeatmapDemoResponse(
            store_id=store,
            date=day,
            data_origin="DEMO",
            grid_width=10,
            grid_height=8,
            cells=cells,
            insights=["Intensidades sintéticas de demonstração."] if cells else [],
        )
