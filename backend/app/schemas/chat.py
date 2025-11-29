from datetime import datetime
from typing import List

from pydantic import BaseModel


class ChatMessageRead(BaseModel):
    id: int
    course_id: int
    author_id: int
    author_name: str
    is_teacher: bool
    text: str
    created_at: datetime

    class Config:
        orm_mode = True


class ChatMessageCreate(BaseModel):
    text: str


class ChatMessageListResponse(BaseModel):
    items: List[ChatMessageRead]
