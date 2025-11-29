from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_student
from app.db.session import get_db
from app.models.assignment import Assignment, Submission
from app.models.course import Course, Lesson, Module
from app.schemas.grade import GradeItem, GradeListResponse

router = APIRouter(prefix="/grades", tags=["grades"])


@router.get("/my", response_model=GradeListResponse, summary="Latest grades per assignment for current student")
def get_my_grades(current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    latest_attempts = (
        db.query(
            Submission.assignment_id,
            func.max(Submission.attempt_number).label("max_attempt"),
        )
        .filter(Submission.student_id == current_user.id)
        .group_by(Submission.assignment_id)
        .subquery()
    )

    submissions = (
        db.query(Submission, Assignment, Course)
        .join(
            latest_attempts,
            (Submission.assignment_id == latest_attempts.c.assignment_id)
            & (Submission.attempt_number == latest_attempts.c.max_attempt),
        )
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Lesson, Assignment.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .join(Course, Module.course_id == Course.id)
        .filter(Submission.student_id == current_user.id)
        .order_by(Submission.checked_at.desc().nullslast(), Submission.submitted_at.desc())
        .all()
    )

    items = [
        GradeItem(
            assignment_id=sub.assignment_id,
            assignment_title=assignment.title,
            course_id=course.id,
            course_title=course.title,
            status=sub.status.value,
            attempt_number=sub.attempt_number,
            max_score=assignment.max_score,
            score=sub.score,
            teacher_comment=sub.teacher_comment,
            submitted_at=sub.submitted_at,
            checked_at=sub.checked_at,
        )
        for sub, assignment, course in submissions
    ]
    return GradeListResponse(items=items)
