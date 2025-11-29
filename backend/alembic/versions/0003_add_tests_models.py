"""Add test models."""
# NOTE: This migration is written to be idempotent.
# It safely skips creation of tables/columns if they already exist.

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0003_add_tests_models"
down_revision = "0002_add_attempt_number_to_submission"
branch_labels = None
depends_on = None


def table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return table_name in inspector.get_table_names()


def enum_exists(enum_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return any(e["name"] == enum_name for e in inspector.get_enums())


def upgrade() -> None:
    if not table_exists("tests"):
        op.create_table(
            "tests",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("course_id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("time_limit_minutes", sa.Integer(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["course_id"], ["courses.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not table_exists("test_questions"):
        op.create_table(
            "test_questions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("test_id", sa.Integer(), nullable=False),
            sa.Column("text", sa.Text(), nullable=False),
            sa.Column("type", sa.Enum("single", "multiple", name="questiontype"), nullable=False),
            sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
            sa.ForeignKeyConstraint(["test_id"], ["tests.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not table_exists("test_options"):
        op.create_table(
            "test_options",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("question_id", sa.Integer(), nullable=False),
            sa.Column("text", sa.Text(), nullable=False),
            sa.Column("is_correct", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.ForeignKeyConstraint(["question_id"], ["test_questions.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not table_exists("test_attempts"):
        op.create_table(
            "test_attempts",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("test_id", sa.Integer(), nullable=False),
            sa.Column("student_id", sa.Integer(), nullable=False),
            sa.Column("started_at", sa.DateTime(), nullable=False),
            sa.Column("finished_at", sa.DateTime(), nullable=True),
            sa.Column("score", sa.Float(), nullable=True),
            sa.Column("max_score", sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(["student_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["test_id"], ["tests.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not table_exists("test_answers"):
        op.create_table(
            "test_answers",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("attempt_id", sa.Integer(), nullable=False),
            sa.Column("question_id", sa.Integer(), nullable=False),
            sa.Column("option_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["attempt_id"], ["test_attempts.id"]),
            sa.ForeignKeyConstraint(["option_id"], ["test_options.id"]),
            sa.ForeignKeyConstraint(["question_id"], ["test_questions.id"]),
            sa.PrimaryKeyConstraint("id"),
        )


def downgrade() -> None:
    if table_exists("test_answers"):
        op.drop_table("test_answers")
    if table_exists("test_attempts"):
        op.drop_table("test_attempts")
    if table_exists("test_options"):
        op.drop_table("test_options")
    if table_exists("test_questions"):
        op.drop_table("test_questions")
    if table_exists("tests"):
        op.drop_table("tests")
    if enum_exists("questiontype"):
        sa.Enum(name="questiontype").drop(op.get_bind(), checkfirst=True)
