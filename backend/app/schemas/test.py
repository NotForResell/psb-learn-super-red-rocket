import enum
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class QuestionType(str, enum.Enum):
    single = "single"
    multiple = "multiple"


class TestOptionRead(BaseModel):
    id: int
    text: str

    class Config:
        orm_mode = True


class TestQuestionRead(BaseModel):
    id: int
    text: str
    type: QuestionType
    order_index: int
    options: List[TestOptionRead]

    class Config:
        orm_mode = True


class TestRead(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str]
    time_limit_minutes: Optional[int]
    questions: List[TestQuestionRead]

    class Config:
        orm_mode = True


class TestSummary(BaseModel):
    id: int
    title: str
    description: Optional[str]
    time_limit_minutes: Optional[int]

    class Config:
        orm_mode = True


class TestListResponse(BaseModel):
    items: List[TestSummary]


class TestAttemptResult(BaseModel):
    id: int
    test_id: int
    student_id: int
    started_at: datetime
    finished_at: Optional[datetime]
    score: Optional[float]
    max_score: Optional[int]

    class Config:
        orm_mode = True


class TestAttemptListResponse(BaseModel):
    items: List[TestAttemptResult]


class TestOptionCreate(BaseModel):
    text: str
    is_correct: bool


class TestQuestionCreate(BaseModel):
    text: str
    type: QuestionType
    order_index: int = 0
    options: List[TestOptionCreate]


class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    is_published: bool = True


class QuestionAnswerPayload(BaseModel):
    question_id: int
    selected_option_ids: List[int]


class TestSubmitPayload(BaseModel):
    answers: List[QuestionAnswerPayload]


class TestSubmitResult(BaseModel):
    attempt_id: int
    score: float
    max_score: int
