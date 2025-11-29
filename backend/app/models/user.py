import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text

from app.db.base import Base


class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    avatar_url = Column(Text, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.student, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
