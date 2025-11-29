from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_student
from app.db.session import get_db
from app.models.assignment import Assignment
from app.models.course import Lesson

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/{lesson_id}", summary="Lesson details for students")
def get_lesson(lesson_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    assignment = db.query(Assignment).filter(Assignment.lesson_id == lesson_id).first()
    return {
        "lesson": {
            "id": lesson.id,
            "title": lesson.title,
            "short_description": lesson.short_description,
            "content_html": lesson.content_html,
            "order_index": lesson.order_index,
            "module_id": lesson.module_id,
        },
        "assignment": assignment,
    }
