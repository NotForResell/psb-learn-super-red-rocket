from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.chat import ChatMessage
from app.models.course import Course, Enrollment
from app.schemas.chat import ChatMessageRead, ChatMessageCreate, ChatMessageListResponse

router = APIRouter(prefix="/courses/{course_id}/chat", tags=["chat"])


def ensure_course_access(db: Session, course_id: int, user_id: int) -> None:
    if not db.query(Course).filter(Course.id == course_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Курс не найден")
    enrolled = db.query(Enrollment).filter(Enrollment.course_id == course_id, Enrollment.student_id == user_id).first()
    if not enrolled:
        # позволяем преподавателю, если он владелец
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course or course.owner_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нет доступа к чату курса")


@router.get("/messages", response_model=ChatMessageListResponse, summary="Сообщения чата курса")
def get_messages(
    course_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
):
    ensure_course_access(db, course_id, current_user.id)
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.course_id == course_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
        .all()
    )
    items = [
        ChatMessageRead(
            id=msg.id,
            course_id=msg.course_id,
            author_id=msg.author_id,
            author_name=msg.author.full_name if msg.author else "Пользователь",
            is_teacher=msg.is_teacher,
            text=msg.text,
            created_at=msg.created_at,
        )
        for msg in messages
    ]
    return ChatMessageListResponse(items=items)


@router.post("/messages", response_model=ChatMessageRead, status_code=status.HTTP_201_CREATED, summary="Отправить сообщение")
def post_message(
    course_id: int,
    payload: ChatMessageCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_course_access(db, course_id, current_user.id)
    message = ChatMessage(
        course_id=course_id,
        author_id=current_user.id,
        text=payload.text,
        created_at=datetime.utcnow(),
        is_teacher=current_user.role == "teacher",
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return ChatMessageRead(
        id=message.id,
        course_id=message.course_id,
        author_id=message.author_id,
        author_name=current_user.full_name,
        is_teacher=message.is_teacher,
        text=message.text,
        created_at=message.created_at,
    )
