from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from uuid import NAMESPACE_URL, UUID, uuid5

from sqlalchemy.orm import Session

from app import monitor_dto as dto
from app.monitor_models import DemoCamera, HeatmapCell, MonitoringSnapshot, StoreZone
from app.seed_demo import STORE_IDS


def stable(value: str) -> UUID:
    return uuid5(NAMESPACE_URL, "nexo/" + value)


def seed_monitoring(session: Session, base: date) -> None:
    for store in STORE_IDS:
        camera_id, zone_id = stable(f"camera/{store}"), stable(f"zone/{store}")
        camera = dto.CameraDemo(
            id=camera_id,
            store_id=store,
            name="Câmera DEMO",
            placement="Entrada fictícia",
            status="SIMULATED_ON",
            is_simulated=True,
        )
        zone = dto.StoreZone(
            id=zone_id,
            store_id=store,
            name="Corredor DEMO",
            grid_x=3,
            grid_y=2,
            grid_width=4,
            grid_height=3,
        )
        old_camera = session.get(DemoCamera, camera_id)
        if old_camera is None:
            session.add(DemoCamera(**camera.model_dump()))
        elif old_camera.store_id != store or not old_camera.is_simulated:
            raise RuntimeError("Colisão de câmera DEMO")
        old_zone = session.get(StoreZone, zone_id)
        if old_zone is None:
            session.add(StoreZone(**zone.model_dump()))
        elif old_zone.store_id != store or old_zone.name != zone.name:
            raise RuntimeError("Colisão de zona DEMO")
        session.flush()
        snapshot_id = stable(f"snapshot/{store}")
        old_snapshot = session.get(MonitoringSnapshot, snapshot_id)
        if old_snapshot is None:
            session.add(
                MonitoringSnapshot(
                    id=snapshot_id,
                    store_id=store,
                    captured_at=datetime.combine(base, datetime.min.time(), tzinfo=UTC),
                    people_now=18,
                    entries_today=126,
                    exits_today=103,
                    data_origin="DEMO",
                    zone_occupancy=[
                        dto.ZoneOccupancy(
                            zone_id=zone_id, zone_name=zone.name, percentage=50, estimated_count=9
                        ).model_dump(mode="json")
                    ],
                )
            )
        elif old_snapshot.store_id != store or old_snapshot.data_origin != "DEMO":
            raise RuntimeError("Colisão de snapshot DEMO")
        for offset in range(7):
            day = base - timedelta(days=offset)
            for y in range(8):
                for x in range(10):
                    cell_id = stable(f"cell/{store}/{day}/{x}/{y}")
                    if session.get(HeatmapCell, cell_id) is not None:
                        continue
                    intensity = Decimal("0.75") if 3 <= x <= 6 and 2 <= y <= 4 else Decimal("0.15")
                    dto.HeatmapCell(grid_x=x, grid_y=y, intensity=float(intensity))
                    session.add(
                        HeatmapCell(
                            id=cell_id,
                            store_id=store,
                            metric_date=day,
                            grid_x=x,
                            grid_y=y,
                            intensity=intensity,
                        )
                    )
    session.flush()
