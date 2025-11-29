from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class CourseBase(BaseModel):
    title: str
    short_description: str
    long_description: str
    level: str
    tags: Optional[str] = None
    estimated_hours: Optional[int] = None
    is_published: bool = False
    owner_id: int


class CourseCreate(CourseBase):
    pass


class ModuleRead(BaseModel):
    id: int
    title: str
    order_index: int

    class Config:
        orm_mode = True


class LessonRead(BaseModel):
    id: int
    module_id: int
    title: str
    short_description: str
    content_html: str
    order_index: int

    class Config:
        orm_mode = True


class CourseRead(CourseBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class CourseDetail(BaseModel):
    id: int
    title: str
    short_description: str
    long_description: str
    level: str
    tags: Optional[str]
    estimated_hours: Optional[int]
    is_published: bool
    owner_id: int
    created_at: datetime
    modules: List[ModuleRead]
    lessons_count: int
    assignments_count: int

    class Config:
        orm_mode = True


class EnrollmentRead(BaseModel):
    id: int
    course_id: int
    student_id: int
    enrolled_at: datetime

    class Config:
        orm_mode = True
