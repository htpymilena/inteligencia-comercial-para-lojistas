"""M04 transactional demo recommendations."""

import sqlalchemy as sa

from alembic import op

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "recommendations",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("store_id", sa.Uuid(), sa.ForeignKey("stores.id"), nullable=False),
        *[
            sa.Column(c, sa.String(), nullable=False)
            for c in (
                "title",
                "hypothesis",
                "evidence",
                "priority",
                "status",
                "generation_method",
                "data_origin",
            )
        ],
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.CheckConstraint("priority IN ('HIGH','MEDIUM','LOW')"),
        sa.CheckConstraint("status IN ('PROPOSED','ACCEPTED','DISMISSED')"),
        sa.CheckConstraint("generation_method = 'RULE_BASED_DEMO' AND data_origin = 'DEMO'"),
        sa.CheckConstraint("length(title)>0 AND length(hypothesis)>0 AND length(evidence)>0"),
    )
    op.create_index(
        "ix_recommendations_store_status_created",
        "recommendations",
        ["store_id", "status", "created_at"],
    )


def downgrade():
    op.drop_table("recommendations")
