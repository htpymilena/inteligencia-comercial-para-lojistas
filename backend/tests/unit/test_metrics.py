from datetime import date, timedelta
from decimal import Decimal

import pytest

from app.core.errors import DomainError
from app.services.metrics import Totals, change, differences, money, period, ratio


@pytest.mark.parametrize("value", ["-0.01", "1.234", "NaN", "Infinity", "1000000000000"])
def test_financial_rejection(value):
    with pytest.raises(ValueError):
        money(Decimal(value))


def test_decimal_conversion_and_zero():
    assert money(Decimal("0.10") + Decimal("0.20")) == Decimal("0.30")
    assert str(money(Decimal("1.230"))) == "1.23"
    assert ratio(20, 300) == 6.67
    assert ratio(0, 0) is None
    assert change(20, 0) is None
    current = Totals(100, 150, 15, Decimal("0.30"), 1)
    previous = Totals(100, 20, 10, Decimal("1.00"), 1)
    assert current.payload()["interactions"] == 150
    assert differences(current, previous)["conversion_change_pp"] == 5
    assert Totals(0, 150, 0, Decimal(0), 1).payload()["conversion_rate"] is None


def test_period_boundaries():
    assert period(date(2026, 11, 10), date(2026, 11, 12)) == (
        date(2026, 11, 7),
        date(2026, 11, 9),
        3,
    )
    start = date(2026, 1, 1)
    assert period(start, start + timedelta(days=365))[2] == 366
    for end in (start - timedelta(days=1), start + timedelta(days=366)):
        with pytest.raises(DomainError) as error:
            period(start, end)
        assert error.value.status == 422


def test_seed_validates_before_writing(monkeypatch):
    from app import seed_metrics as module

    class NoWrites:
        def __getattr__(self, name):
            raise AssertionError("Persistência não pode ser chamada para dado inválido")

    def invalid(value):
        return money(Decimal("1.234"))

    monkeypatch.setattr(module, "money", invalid)
    with pytest.raises(ValueError):
        module.seed_metrics(NoWrites(), date(2026, 11, 14))
