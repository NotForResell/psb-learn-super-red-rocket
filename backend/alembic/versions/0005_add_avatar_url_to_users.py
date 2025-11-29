"""Add avatar_url to users table (idempotent)."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# ID новой миграции и предыдущая
revision = "0005_add_avatar_url_to_users"
down_revision = "0004_add_chat_message"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    # если таблицы users нет — просто выходим
    if "users" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("users")}

    # колонка уже есть — ничего не делаем
    if "avatar_url" in columns:
        return

    op.add_column(
        "users",
        sa.Column("avatar_url", sa.String(length=512), nullable=True),
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)

    if "users" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("users")}

    if "avatar_url" not in columns:
        return

    op.drop_column("users", "avatar_url")
