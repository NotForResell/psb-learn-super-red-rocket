import enum
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel


class DeadlineSeverity(str, enum.Enum):
    normal = "normal"
    due_soon = "due_soon"
    overdue = "overdue"


class DeadlineItem(BaseModel):
    assignment_id: int
    assignment_title: str
    course_id: int
    course_title: str
    lesson_id: Optional[int] = None
    lesson_title: Optional[str] = None
    due_date: Optional[datetime | date]
    status: str
    severity: DeadlineSeverity
    days_left: Optional[int]


class DeadlineListResponse(BaseModel):
    items: List[DeadlineItem]
