from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.metric_models import DailyMetric
from app.seed_demo import STORE_IDS
from app.seed_metrics import seed_metrics
from tests.integration.test_identity import login


def test_seed_and_queries(api_client, seeded_session):
    base = date(2026, 11, 14)
    seed_metrics(seeded_session, base)
    seed_metrics(seeded_session, base)
    assert seeded_session.scalar(select(func.count()).select_from(DailyMetric)) == 180
    headers = login(api_client)
    query = {"period_start": "2026-11-10", "period_end": "2026-11-12"}
    url = f"/api/v1/stores/{STORE_IDS[0]}"
    series = api_client.get(url + "/metrics/daily", params=query, headers=headers)
    summary = api_client.get(url + "/dashboard", params=query, headers=headers)
    assert series.status_code == summary.status_code == 200
    assert summary.json()["visitors"] == sum(r["visitor_count"] for r in series.json()["items"])
    assert (
        api_client.get(
            f"/api/v1/stores/{STORE_IDS[1]}/dashboard", params=query, headers=headers
        ).status_code
        == 403
    )
    query["period_start"] = "2026-11-13"
    assert api_client.get(url + "/dashboard", params=query, headers=headers).status_code == 422


def test_negative_constraint_and_interactions(seeded_session):
    row = DailyMetric(
        store_id=STORE_IDS[0],
        metric_date=date(2020, 1, 1),
        visitor_count=100,
        interaction_count=150,
        sales_count=0,
        revenue_brl=Decimal("0.00"),
    )
    seeded_session.add(row)
    seeded_session.flush()
    with pytest.raises(IntegrityError), seeded_session.begin_nested():
        row.revenue_brl = Decimal("-0.01")
        seeded_session.flush()
