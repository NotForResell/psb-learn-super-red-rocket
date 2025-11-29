from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_student
from app.db.session import get_db
from app.models.assignment import Assignment, Submission, SubmissionStatus
from app.models.course import Course, Lesson, Module, Enrollment
from app.schemas.deadline import DeadlineItem, DeadlineListResponse, DeadlineSeverity

router = APIRouter(prefix="/deadlines", tags=["deadlines"])


def parse_date_param(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


@router.get("/my", response_model=DeadlineListResponse, summary="Deadlines for current student")
def get_my_deadlines(
    current_user=Depends(get_current_student),
    db: Session = Depends(get_db),
    from_date: Optional[str] = Query(None, description="ISO date filter from"),
    to_date: Optional[str] = Query(None, description="ISO date filter to"),
):
    from_dt = parse_date_param(from_date)
    to_dt = parse_date_param(to_date)

    assignments = (
        db.query(Assignment, Course, Lesson)
        .join(Lesson, Assignment.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .join(Course, Module.course_id == Course.id)
        .join(Enrollment, Enrollment.course_id == Course.id)
        .filter(Enrollment.student_id == current_user.id)
        .all()
    )

    items: List[DeadlineItem] = []
    today = datetime.utcnow().date()

    for assignment, course, lesson in assignments:
        if from_dt and assignment.due_date and assignment.due_date < from_dt:
            continue
        if to_dt and assignment.due_date and assignment.due_date > to_dt:
            continue

        latest_submission = (
            db.query(Submission)
            .filter(Submission.assignment_id == assignment.id, Submission.student_id == current_user.id)
            .order_by(
                Submission.attempt_number.desc(),
                Submission.submitted_at.desc().nullslast(),
                Submission.id.desc(),
            )
            .first()
        )
        if latest_submission is None:
            status = "not_submitted"
        elif latest_submission.status == SubmissionStatus.checked or latest_submission.checked_at or latest_submission.score is not None:
            status = "checked"
        else:
            status = "submitted"

        severity = DeadlineSeverity.normal
        days_left: Optional[int] = None
        if assignment.due_date:
            due_date_only = assignment.due_date.date()
            days_left = (due_date_only - today).days
            if days_left < 0:
                severity = DeadlineSeverity.overdue
            elif days_left <= 3:
                severity = DeadlineSeverity.due_soon

        items.append(
            DeadlineItem(
                assignment_id=assignment.id,
                assignment_title=assignment.title,
                course_id=course.id,
                course_title=course.title,
                lesson_id=lesson.id,
                lesson_title=lesson.title,
                due_date=assignment.due_date,
                status=status,
                severity=severity,
                days_left=days_left,
            )
        )

    items_sorted = sorted(items, key=lambda i: (i.due_date is None, i.due_date or datetime.max))
    return DeadlineListResponse(items=items_sorted)
