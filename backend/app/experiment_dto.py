from datetime import date, datetime
from typing import Literal, Self
from uuid import UUID

from pydantic import Field, model_validator

from app.comparison_dto import MetricChanges, MetricTotals
from app.dto import DTO

ExperimentMetric = Literal["VISITORS", "SALES", "REVENUE", "CONVERSION"]
ExperimentStatus = Literal["DRAFT", "RUNNING", "COMPLETED", "CANCELLED"]


class Experiment(DTO):
    id: UUID
    store_id: UUID
    recommendation_id: UUID
    title: str = Field(min_length=1)
    metric: ExperimentMetric
    start_date: date
    end_date: date
    status: ExperimentStatus
    created_at: datetime
    updated_at: datetime


class ExperimentListResponse(DTO):
    items: list[Experiment]


class ExperimentCreateRequest(DTO):
    recommendation_id: UUID
    title: str = Field(min_length=3, max_length=140)
    metric: ExperimentMetric
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def valid_dates(self) -> Self:
        if self.start_date > self.end_date:
            raise ValueError("Período inválido")
        return self


class ExperimentStatusUpdateRequest(DTO):
    status: Literal["RUNNING", "COMPLETED", "CANCELLED"]


class ExperimentResultResponse(DTO):
    experiment_id: UUID
    available: bool
    reason: str | None
    data_origin: Literal["DEMO"]
    baseline: MetricTotals | None
    during: MetricTotals | None
    changes: MetricChanges | None
    disclaimer: str
