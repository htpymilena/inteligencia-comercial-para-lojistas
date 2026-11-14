"""M03 synthetic monitoring only."""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

from alembic import op

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def keys():
    return [
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("store_id", sa.Uuid(), sa.ForeignKey("stores.id"), nullable=False),
    ]


def upgrade():
    op.create_table(
        "demo_cameras",
        *keys(),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("placement", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("is_simulated", sa.Boolean(), nullable=False),
        sa.CheckConstraint("is_simulated = true"),
        sa.CheckConstraint("status IN ('SIMULATED_ON','SIMULATED_OFF')"),
    )
    op.create_table(
        "store_zones",
        *keys(),
        sa.Column("name", sa.String(), nullable=False),
        *[
            sa.Column(c, sa.Integer(), nullable=False)
            for c in ("grid_x", "grid_y", "grid_width", "grid_height")
        ],
        sa.UniqueConstraint("store_id", "name"),
        sa.CheckConstraint(
            "grid_x >= 0 AND grid_y >= 0 AND grid_width >= 1 AND grid_height >= 1"
            " AND grid_x + grid_width <= 10 AND grid_y + grid_height <= 8"
        ),
    )
    op.create_table(
        "heatmap_cells",
        *keys(),
        sa.Column("metric_date", sa.Date(), nullable=False),
        sa.Column("grid_x", sa.Integer(), nullable=False),
        sa.Column("grid_y", sa.Integer(), nullable=False),
        sa.Column("intensity", sa.Numeric(4, 3), nullable=False),
        sa.UniqueConstraint("store_id", "metric_date", "grid_x", "grid_y"),
        sa.CheckConstraint("grid_x BETWEEN 0 AND 9 AND grid_y BETWEEN 0 AND 7"),
        sa.CheckConstraint("intensity BETWEEN 0 AND 1"),
    )
    op.create_table(
        "monitoring_snapshots",
        *keys(),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False),
        *[
            sa.Column(c, sa.Integer(), nullable=False)
            for c in ("people_now", "entries_today", "exits_today")
        ],
        sa.Column("zone_occupancy", JSONB(), nullable=False),
        sa.Column("data_origin", sa.String(), nullable=False),
        sa.CheckConstraint("people_now >= 0 AND entries_today >= 0 AND exits_today >= 0"),
        sa.CheckConstraint("data_origin = 'DEMO'"),
    )


def downgrade():
    for name in ("monitoring_snapshots", "heatmap_cells", "store_zones", "demo_cameras"):
        op.drop_table(name)
