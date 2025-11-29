import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.course import Lesson
from app.models.user import User


class SubmissionStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    checked = "checked"


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    max_score = Column(Integer, nullable=False)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    lesson = relationship(Lesson, back_populates="assignment")
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    attempt_number = Column(Integer, nullable=False, default=1)
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.draft, nullable=False)
    score = Column(Float, nullable=True)
    student_comment = Column(Text, nullable=True)
    teacher_comment = Column(Text, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    checked_at = Column(DateTime, nullable=True)

    assignment = relationship(Assignment, back_populates="submissions")
    student = relationship(User, backref="submissions")
    files = relationship("SubmissionFile", back_populates="submission", cascade="all, delete")


class SubmissionFile(Base):
    __tablename__ = "submission_files"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    file_path = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship(Submission, back_populates="files")
