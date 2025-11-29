from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.user import User


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    short_description = Column(String, nullable=False)
    long_description = Column(Text, nullable=False)
    level = Column(String, nullable=False)
    tags = Column(String, nullable=True)
    estimated_hours = Column(Integer, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owner = relationship(User, backref="owned_courses")
    modules = relationship("Module", back_populates="course", cascade="all, delete")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete")


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False, default=0)

    course = relationship(Course, back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    short_description = Column(String, nullable=False)
    content_html = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False, default=0)

    module = relationship(Module, back_populates="lessons")
    assignment = relationship(
        "Assignment",
        uselist=False,
        back_populates="lesson",
        cascade="all, delete",
    )


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    student = relationship(User, backref="enrollments")
    course = relationship(Course, back_populates="enrollments")
