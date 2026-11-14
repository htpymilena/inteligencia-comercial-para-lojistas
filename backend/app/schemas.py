from typing import Any, Literal

from pydantic import BaseModel, ConfigDict


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class HealthResponse(StrictModel):
    status: Literal["ok"]
    service: str


class ApiErrorDetail(StrictModel):
    code: str
    message: str
    details: dict[str, Any] | None


class ApiError(StrictModel):
    error: ApiErrorDetail
    request_id: str
