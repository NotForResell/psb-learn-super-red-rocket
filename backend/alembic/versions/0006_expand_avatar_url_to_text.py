"""Expand avatar_url column to TEXT for longer data URLs."""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0006_expand_avatar_url_to_text"
down_revision = "0005_add_avatar_url_to_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("avatar_url", type_=sa.Text(), existing_nullable=True)


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("avatar_url", type_=sa.String(length=512), existing_nullable=True)
