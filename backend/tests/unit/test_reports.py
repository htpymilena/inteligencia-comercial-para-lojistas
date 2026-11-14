from datetime import date
from decimal import Decimal
from uuid import uuid4

from app.services.metrics import Totals
from app.services.reports import ReportService


def test_report_windows_and_shared_calculation():
    calls = []

    class Repository:
        def totals(self, store, start, end):
            calls.append((start, end))
            sales = 15 if start == date(2026, 11, 10) else 10
            return Totals(100, 150, sales, Decimal("0.30"), 3)

    service = ReportService(None)
    service.repository = Repository()
    result = service.summary(uuid4(), date(2026, 11, 10), date(2026, 11, 12))
    assert calls == [
        (date(2026, 11, 10), date(2026, 11, 12)),
        (date(2026, 11, 7), date(2026, 11, 9)),
    ]
    assert result.available and result.changes.conversion_change_pp == 5
    assert result.current.revenue_brl == "0.30"


def test_zero_and_incomplete_report():
    class Repository:
        days = 3

        def totals(self, *args):
            return Totals(0, 0, 0, Decimal(0), self.days)

    service = ReportService(None)
    repository = Repository()
    service.repository = repository
    result = service.summary(uuid4(), date(2026, 11, 10), date(2026, 11, 12))
    assert result.available
    assert result.current.conversion_rate is None
    assert result.changes.visitor_change_percent is None
    repository.days = 2
    result = service.summary(uuid4(), date(2026, 11, 10), date(2026, 11, 12))
    assert not result.available and result.reason
    assert result.baseline is result.current is result.changes is None
