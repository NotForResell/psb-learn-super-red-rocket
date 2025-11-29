from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class GradeItem(BaseModel):
    assignment_id: int
    assignment_title: str
    course_id: int
    course_title: str
    status: str
    attempt_number: Optional[int]
    max_score: int
    score: Optional[float]
    teacher_comment: Optional[str]
    submitted_at: Optional[datetime]
    checked_at: Optional[datetime]


class GradeListResponse(BaseModel):
    items: List[GradeItem]
