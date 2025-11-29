import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
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
from app.models.course import Course
from app.models.user import User


class QuestionType(str, enum.Enum):
    single = "single"
    multiple = "multiple"


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)
    time_limit_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    course = relationship(Course, backref="tests")
    questions = relationship("TestQuestion", back_populates="test", cascade="all, delete-orphan")
    attempts = relationship("TestAttempt", back_populates="test", cascade="all, delete-orphan")


class TestQuestion(Base):
    __tablename__ = "test_questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    text = Column(Text, nullable=False)
    type = Column(Enum(QuestionType), nullable=False)
    order_index = Column(Integer, default=0, nullable=False)

    test = relationship(Test, back_populates="questions")
    options = relationship("TestOption", back_populates="question", cascade="all, delete-orphan")
    answers = relationship("TestAnswer", back_populates="question", cascade="all, delete-orphan")


class TestOption(Base):
    __tablename__ = "test_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("test_questions.id"), nullable=False)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)

    question = relationship(TestQuestion, back_populates="options")
    answers = relationship("TestAnswer", back_populates="option", cascade="all, delete-orphan")


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    finished_at = Column(DateTime, nullable=True)
    score = Column(Float, nullable=True)
    max_score = Column(Integer, nullable=True)

    test = relationship(Test, back_populates="attempts")
    student = relationship(User, backref="test_attempts")
    answers = relationship("TestAnswer", back_populates="attempt", cascade="all, delete-orphan")


class TestAnswer(Base):
    __tablename__ = "test_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("test_attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("test_questions.id"), nullable=False)
    option_id = Column(Integer, ForeignKey("test_options.id"), nullable=False)

    attempt = relationship(TestAttempt, back_populates="answers")
    question = relationship(TestQuestion, back_populates="answers")
    option = relationship(TestOption, back_populates="answers")
