"""Initial empty migration placeholder."""

from alembic import op

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tables are created via SQLAlchemy models and init_db during prototype phase.
    pass


def downgrade() -> None:
    pass
