"""M02 daily demo metrics."""

import sqlalchemy as sa

from alembic import op

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "daily_metrics",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("store_id", sa.Uuid(), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("metric_date", sa.Date(), nullable=False),
        sa.Column("visitor_count", sa.Integer(), nullable=False),
        sa.Column("interaction_count", sa.Integer(), nullable=False),
        sa.Column("sales_count", sa.Integer(), nullable=False),
        sa.Column("revenue_brl", sa.Numeric(14, 2), nullable=False),
        sa.Column("data_origin", sa.String(), nullable=False),
        sa.UniqueConstraint("store_id", "metric_date"),
        sa.CheckConstraint("visitor_count >= 0 AND interaction_count >= 0 AND sales_count >= 0"),
        sa.CheckConstraint("revenue_brl >= 0 AND revenue_brl != 'NaN'::numeric"),
        sa.CheckConstraint("data_origin = 'DEMO'"),
    )


def downgrade():
    op.drop_table("daily_metrics")
