"""Add attempt_number to submissions."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = "0002_add_attempt_number_to_submission"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Idempotent upgrade that only adds the column if needed."""
    bind = op.get_bind()
    inspector = inspect(bind)

    if "submissions" not in inspector.get_table_names():
        # Table is not present yet (fresh DB created via create_all later).
        return

    columns = [c["name"] for c in inspector.get_columns("submissions")]
    has_column = "attempt_number" in columns

    if not has_column:
        op.add_column(
            "submissions",
            sa.Column("attempt_number", sa.Integer(), nullable=True),
        )
        has_column = True

    if has_column:
        submissions = sa.table(
            "submissions",
            sa.column("attempt_number", sa.Integer()),
        )
        op.execute(submissions.update().values(attempt_number=1))
        op.alter_column(
            "submissions",
            "attempt_number",
            nullable=False,
            server_default="1",
        )


def downgrade() -> None:
    """Idempotent downgrade that drops the column only if it exists."""
    bind = op.get_bind()
    inspector = inspect(bind)

    if "submissions" not in inspector.get_table_names():
        return

    columns = [c["name"] for c in inspector.get_columns("submissions")]
    if "attempt_number" in columns:
        op.drop_column("submissions", "attempt_number")
