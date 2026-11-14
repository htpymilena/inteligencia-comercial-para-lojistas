from datetime import date
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app import circuit_dto as dto
from app.circuit_models import Circuit
from app.core.errors import DomainError
from app.services.circuits import CircuitRepository, VALID_TRANSITIONS


def test_circuit_create_request_requires_3_unique_stores():
    stores = [uuid4(), uuid4(), uuid4()]
    req = dto.CircuitCreateRequest(
        name="Circuito Teste",
        reward_description="10% desconto em parceiros",
        store_ids=stores,
        start_date=date(2026, 11, 1),
        end_date=date(2026, 11, 30),
    )
    assert req.name == "Circuito Teste"
    assert len(req.store_ids) == 3


def test_circuit_create_request_rejects_duplicate_stores():
    s1, s2 = uuid4(), uuid4()
    with pytest.raises(ValidationError):
        dto.CircuitCreateRequest(
            name="Circuito Duplicado",
            reward_description="10% desconto em parceiros",
            store_ids=[s1, s2, s1],
            start_date=date(2026, 11, 1),
            end_date=date(2026, 11, 30),
        )


def test_circuit_create_request_rejects_invalid_date_range():
    stores = [uuid4(), uuid4(), uuid4()]
    with pytest.raises(ValidationError):
        dto.CircuitCreateRequest(
            name="Circuito Invalido",
            reward_description="10% desconto",
            store_ids=stores,
            start_date=date(2026, 11, 30),
            end_date=date(2026, 11, 1),
        )


def test_circuit_transitions():
    assert "ACTIVE" in VALID_TRANSITIONS["DRAFT"]
    assert "CANCELLED" in VALID_TRANSITIONS["DRAFT"]
    assert "FINISHED" in VALID_TRANSITIONS["ACTIVE"]
    assert "CANCELLED" in VALID_TRANSITIONS["ACTIVE"]
    assert len(VALID_TRANSITIONS["FINISHED"]) == 0
    assert len(VALID_TRANSITIONS["CANCELLED"]) == 0
