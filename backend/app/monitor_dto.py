from datetime import date, datetime
from typing import Literal, Self
from uuid import UUID

from pydantic import Field, model_validator

from app.dto import DTO
from app.metric_dto import Nonnegative


class CameraDemo(DTO):
    id: UUID
    store_id: UUID
    name: str
    placement: str
    status: Literal["SIMULATED_ON", "SIMULATED_OFF"]
    is_simulated: Literal[True]


class CameraListResponse(DTO):
    items: list[CameraDemo]
    data_origin: Literal["DEMO"]


class ZoneOccupancy(DTO):
    zone_id: UUID
    zone_name: str
    percentage: float = Field(ge=0, le=100)
    estimated_count: Nonnegative


class MonitoringDemoResponse(DTO):
    store_id: UUID
    is_simulated: Literal[True]
    data_origin: Literal["DEMO"]
    snapshot_at: datetime
    people_now: Nonnegative
    entries_today: Nonnegative
    exits_today: Nonnegative
    zones: list[ZoneOccupancy]


class StoreZone(DTO):
    id: UUID
    store_id: UUID
    name: str
    grid_x: int = Field(ge=0, le=9)
    grid_y: int = Field(ge=0, le=7)
    grid_width: int = Field(ge=1, le=10)
    grid_height: int = Field(ge=1, le=8)

    @model_validator(mode="after")
    def contained(self) -> Self:
        if self.grid_x + self.grid_width > 10 or self.grid_y + self.grid_height > 8:
            raise ValueError("Zona fora da grade")
        return self


class ZoneListResponse(DTO):
    items: list[StoreZone]
    data_origin: Literal["DEMO"]


class HeatmapCell(DTO):
    grid_x: int = Field(ge=0, le=9)
    grid_y: int = Field(ge=0, le=7)
    intensity: float = Field(ge=0, le=1)


class HeatmapDemoResponse(DTO):
    store_id: UUID
    date: date
    data_origin: Literal["DEMO"]
    grid_width: Literal[10]
    grid_height: Literal[8]
    cells: list[HeatmapCell]
    insights: list[str]
