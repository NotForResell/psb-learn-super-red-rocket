from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.assignment import SubmissionStatus


class AssignmentBase(BaseModel):
    lesson_id: int
    title: str
    description: str
    max_score: int
    due_date: Optional[datetime] = None


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentRead(AssignmentBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class SubmissionFileRead(BaseModel):
    id: int
    file_path: str
    original_name: str
    content_type: str
    uploaded_at: datetime

    class Config:
        orm_mode = True


class SubmissionCreate(BaseModel):
    assignment_id: int
    student_comment: Optional[str] = None


class SubmissionRead(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    attempt_number: int
    status: SubmissionStatus
    score: Optional[float]
    student_comment: Optional[str]
    teacher_comment: Optional[str]
    submitted_at: Optional[datetime]
    checked_at: Optional[datetime]
    files: List[SubmissionFileRead] = []

    class Config:
        orm_mode = True
        use_enum_values = True


class SubmissionListResponse(BaseModel):
    items: List[SubmissionRead]


SubmissionStatusEnum = SubmissionStatus
