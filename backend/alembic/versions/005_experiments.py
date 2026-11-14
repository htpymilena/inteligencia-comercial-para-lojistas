"""M05 experiment lifecycle."""

import sqlalchemy as sa

from alembic import op

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "experiments",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("store_id", sa.Uuid(), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column(
            "recommendation_id", sa.Uuid(), sa.ForeignKey("recommendations.id"), nullable=False
        ),
        *[sa.Column(c, sa.String(), nullable=False) for c in ("title", "metric", "status")],
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.CheckConstraint("status IN ('DRAFT','RUNNING','COMPLETED','CANCELLED')"),
        sa.CheckConstraint("metric IN ('VISITORS','SALES','REVENUE','CONVERSION')"),
        sa.CheckConstraint("start_date <= end_date"),
        sa.CheckConstraint("length(title) BETWEEN 3 AND 140"),
    )
    op.create_index("ix_experiments_store_created", "experiments", ["store_id", "created_at"])


def downgrade():
    op.drop_table("experiments")
