from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.monitor_dto import CameraDemo, HeatmapCell, StoreZone, ZoneOccupancy


@pytest.mark.parametrize(
    "values",
    [
        {"grid_x": 10, "grid_y": 0, "intensity": 0.5},
        {"grid_x": 0, "grid_y": -1, "intensity": 0.5},
        {"grid_x": 0, "grid_y": 0, "intensity": 1.01},
        {"grid_x": 0, "grid_y": 0, "intensity": -0.01},
    ],
)
def test_invalid_cells(values):
    with pytest.raises(ValidationError):
        HeatmapCell(**values)


def test_contained_zone_and_demo():
    with pytest.raises(ValidationError):
        StoreZone(
            id=uuid4(),
            store_id=uuid4(),
            name="Zone",
            grid_x=9,
            grid_y=0,
            grid_width=2,
            grid_height=1,
        )
    with pytest.raises(ValidationError):
        CameraDemo(
            id=uuid4(),
            store_id=uuid4(),
            name="Camera",
            placement="DEMO",
            status="SIMULATED_ON",
            is_simulated=False,
        )
    with pytest.raises(ValidationError):
        ZoneOccupancy(zone_id=uuid4(), zone_name="DEMO", percentage=101, estimated_count=0)
    cells = [HeatmapCell(grid_x=x, grid_y=y, intensity=0.75) for x in range(10) for y in range(8)]
    assert len({(c.grid_x, c.grid_y) for c in cells}) == 80
