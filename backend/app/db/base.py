from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models so that Alembic can discover them.
# pylint: disable=unused-import
from app import models  # noqa: E402,F401
