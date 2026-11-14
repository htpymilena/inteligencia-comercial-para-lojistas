from datetime import date, datetime
from typing import Literal, Self
from uuid import UUID

from pydantic import Field, model_validator

from app.dto import DTO

CircuitStatus = Literal["DRAFT", "ACTIVE", "FINISHED", "CANCELLED"]


class Circuit(DTO):
    id: UUID
    name: str = Field(min_length=1)
    reward_description: str = Field(min_length=1)
    start_date: date
    end_date: date
    status: CircuitStatus
    store_ids: list[UUID] = Field(min_length=3, max_length=3, json_schema_extra={"uniqueItems": True})
    created_at: datetime


class CircuitCreateRequest(DTO):
    name: str = Field(min_length=3, max_length=140)
    reward_description: str = Field(min_length=3, max_length=240)
    store_ids: list[UUID] = Field(min_length=3, max_length=3, json_schema_extra={"uniqueItems": True})
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_circuit(self) -> Self:
        if self.start_date > self.end_date:
            raise ValueError("Data inicial não pode ser posterior à data final")
        if len(set(self.store_ids)) != 3:
            raise ValueError("As 3 lojas do circuito devem ser distintas")
        return self


class CircuitListResponse(DTO):
    items: list[Circuit]


class CircuitStatusUpdateRequest(DTO):
    status: Literal["ACTIVE", "FINISHED", "CANCELLED"]


class CircuitStatsResponse(DTO):
    circuit_id: UUID
    data_origin: Literal["DEMO"]
    period_start: date
    period_end: date
    completed_count: int = Field(ge=0)
