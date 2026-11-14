from datetime import date
from decimal import Decimal
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.core.errors import DomainError
from app.experiment_dto import ExperimentCreateRequest
from app.services.comparison import comparison
from app.services.experiments import experiment_transition
from app.services.metrics import Totals


@pytest.mark.parametrize(
    "source,target",
    [
        ("DRAFT", "RUNNING"),
        ("DRAFT", "CANCELLED"),
        ("RUNNING", "COMPLETED"),
        ("RUNNING", "CANCELLED"),
    ],
)
def test_valid_states(source, target):
    experiment_transition(source, target)


@pytest.mark.parametrize(
    "source,target",
    [
        ("DRAFT", "COMPLETED"),
        ("COMPLETED", "RUNNING"),
        ("CANCELLED", "CANCELLED"),
        ("RUNNING", "DRAFT"),
    ],
)
def test_invalid_states(source, target):
    with pytest.raises(DomainError) as error:
        experiment_transition(source, target)
    assert error.value.status == 409


@pytest.mark.parametrize("title", ["ab", "x" * 141])
def test_invalid_request(title):
    with pytest.raises(ValidationError):
        ExperimentCreateRequest(
            recommendation_id=uuid4(),
            title=title,
            metric="SALES",
            start_date=date(2026, 11, 1),
            end_date=date(2026, 11, 2),
        )
    with pytest.raises(ValidationError):
        ExperimentCreateRequest(
            recommendation_id=uuid4(),
            title="DEMO",
            metric="SALES",
            start_date=date(2026, 11, 2),
            end_date=date(2026, 11, 1),
        )


def test_comparison_availability():
    totals = Totals(300, 400, 20, Decimal("0.30"), 3)
    result = comparison(totals, totals, 3)
    assert result["available"] is True
    assert result["current"]["conversion_rate"] == 6.67
    for payload in (comparison(totals, totals, 3, completed=False), comparison(totals, totals, 4)):
        assert payload["available"] is False and payload["reason"]
        assert payload["current"] is payload["baseline"] is payload["changes"] is None
        assert "causalidade" in payload["disclaimer"]
