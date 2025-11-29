"""Maintenance helpers for database schema tweaks."""

from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import engine

TARGET_LENGTH = 128


def ensure_alembic_version_table() -> None:
    """Ensure alembic_version exists and version_num is wide enough."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        tables = inspector.get_table_names()

        if "alembic_version" not in tables:
            connection.execute(
                text("CREATE TABLE alembic_version (version_num VARCHAR(128) NOT NULL)")
            )
            print("Created alembic_version table with version_num VARCHAR(128).")
            return

        columns = inspector.get_columns("alembic_version")
        version_column = next((c for c in columns if c["name"] == "version_num"), None)
        if version_column is None:
            connection.execute(
                text("ALTER TABLE alembic_version ADD COLUMN version_num VARCHAR(128) NOT NULL")
            )
            print("Added version_num to alembic_version as VARCHAR(128).")
            return

        length = getattr(version_column["type"], "length", None)
        if length is None or length >= TARGET_LENGTH:
            print("alembic_version.version_num already wide enough, nothing to do.")
            return

        connection.execute(
            text("ALTER TABLE alembic_version ALTER COLUMN version_num TYPE VARCHAR(128)")
        )
        print("Upgraded alembic_version.version_num to VARCHAR(128).")


def main() -> None:
    try:
        ensure_alembic_version_table()
        print("Maintenance completed successfully.")
    except SQLAlchemyError as exc:
        print(f"Maintenance failed: {exc}")
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
