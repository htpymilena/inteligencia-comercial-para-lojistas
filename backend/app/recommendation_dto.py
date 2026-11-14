from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.dto import DTO

RecommendationStatus = Literal["PROPOSED", "ACCEPTED", "DISMISSED"]


class Recommendation(DTO):
    id: UUID
    store_id: UUID
    title: str = Field(min_length=1)
    hypothesis: str = Field(min_length=1)
    evidence: str = Field(min_length=1)
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    status: RecommendationStatus
    generation_method: Literal["RULE_BASED_DEMO"]
    data_origin: Literal["DEMO"]
    created_at: datetime
    updated_at: datetime


class RecommendationListResponse(DTO):
    items: list[Recommendation]
    data_origin: Literal["DEMO"]


class RecommendationUpdateRequest(DTO):
    status: Literal["ACCEPTED", "DISMISSED"]
