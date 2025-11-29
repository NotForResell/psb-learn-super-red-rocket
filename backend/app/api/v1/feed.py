from datetime import datetime, timedelta
from typing import List, Set

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_student
from app.db.session import get_db
from app.models.assignment import Assignment, Submission
from app.models.course import Course, Lesson, Module, Enrollment
from app.schemas.feed import FeedItem, FeedItemType, FeedListResponse

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("/my", response_model=FeedListResponse, summary="Recent feed for current student")
def get_my_feed(
    current_user=Depends(get_current_student),
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100, description="Max number of feed items"),
):
    window_start = datetime.utcnow() - timedelta(days=30)

    course_ids = [
        c_id
        for (c_id,) in db.query(Enrollment.course_id)
        .filter(Enrollment.student_id == current_user.id)
        .all()
    ]
    if not course_ids:
        return FeedListResponse(items=[])

    new_assignments = (
        db.query(Assignment, Course)
        .join(Lesson, Assignment.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .join(Course, Module.course_id == Course.id)
        .filter(Course.id.in_(course_ids))
        .filter(Assignment.created_at >= window_start)
        .order_by(Assignment.created_at.desc())
        .all()
    )

    feed_items: List[FeedItem] = []
    for assignment, course in new_assignments:
        feed_items.append(
            FeedItem(
                id=f"new_assignment-{assignment.id}",
                type=FeedItemType.new_assignment,
                created_at=assignment.created_at,
                course_id=course.id,
                course_title=course.title,
                assignment_id=assignment.id,
                assignment_title=assignment.title,
                score=None,
                max_score=assignment.max_score,
                short_text=f"Новое задание «{assignment.title}» в курсе «{course.title}».",
            )
        )

    submissions = (
        db.query(Submission, Assignment, Course)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Lesson, Assignment.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .join(Course, Module.course_id == Course.id)
        .filter(Submission.student_id == current_user.id)
        .filter(Submission.checked_at.isnot(None))
        .filter(Submission.checked_at >= window_start)
        .order_by(Submission.checked_at.desc())
        .all()
    )
    seen_assignments: Set[int] = set()
    for submission, assignment, course in submissions:
        if assignment.id in seen_assignments:
            continue  # keep latest only
        seen_assignments.add(assignment.id)
        feed_items.append(
            FeedItem(
                id=f"grade-{submission.id}",
                type=FeedItemType.grade_updated,
                created_at=submission.checked_at or submission.submitted_at or datetime.utcnow(),
                course_id=course.id,
                course_title=course.title,
                assignment_id=assignment.id,
                assignment_title=assignment.title,
                score=submission.score,
                max_score=assignment.max_score,
                short_text=f"Вы получили оценку {submission.score}/{assignment.max_score} по заданию «{assignment.title}».",
            )
        )

    feed_items_sorted = sorted(feed_items, key=lambda item: item.created_at, reverse=True)[:limit]
    return FeedListResponse(items=feed_items_sorted)
