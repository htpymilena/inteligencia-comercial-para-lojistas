import pytest

from app.core.errors import DomainError
from app.services.recommendations import recommendation_transition


@pytest.mark.parametrize("target", ["ACCEPTED", "DISMISSED"])
def test_proposed_transitions(target):
    recommendation_transition("PROPOSED", target)


@pytest.mark.parametrize(
    "source,target",
    [
        ("ACCEPTED", "DISMISSED"),
        ("ACCEPTED", "ACCEPTED"),
        ("DISMISSED", "ACCEPTED"),
        ("PROPOSED", "PROPOSED"),
    ],
)
def test_terminal_and_invalid_transitions(source, target):
    with pytest.raises(DomainError) as error:
        recommendation_transition(source, target)
    assert error.value.status == 409
