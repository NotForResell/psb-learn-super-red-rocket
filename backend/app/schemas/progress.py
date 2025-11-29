from datetime import datetime

from pydantic import BaseModel


class ProgressSnapshotRead(BaseModel):
    id: int
    student_id: int
    course_id: int
    completed_lessons_count: int
    total_lessons_count: int
    avg_score: float | None
    updated_at: datetime

    class Config:
        orm_mode = True
