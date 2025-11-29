import enum
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class FeedItemType(str, enum.Enum):
    new_assignment = "new_assignment"
    grade_updated = "grade_updated"


class FeedItem(BaseModel):
    id: str
    type: FeedItemType
    created_at: datetime
    course_id: int
    course_title: str
    assignment_id: Optional[int] = None
    assignment_title: Optional[str] = None
    score: Optional[float] = None
    max_score: Optional[int] = None
    short_text: str


class FeedListResponse(BaseModel):
    items: List[FeedItem]
