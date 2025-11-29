from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.course import Course
from app.models.user import User


class ProgressSnapshot(Base):
    __tablename__ = "progress_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    completed_lessons_count = Column(Integer, default=0, nullable=False)
    total_lessons_count = Column(Integer, default=0, nullable=False)
    avg_score = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    student = relationship(User, backref="progress_snapshots")
    course = relationship(Course, backref="progress_snapshots")
