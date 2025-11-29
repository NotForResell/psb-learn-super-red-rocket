from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_student
from app.db.session import get_db
from app.models.assignment import Assignment, Submission, SubmissionStatus
from app.models.course import Course, Lesson, Module
from app.models.progress import ProgressSnapshot
from app.schemas.progress import ProgressSnapshotRead

router = APIRouter(prefix="/progress", tags=["progress"])


def calculate_progress(db: Session, student_id: int, course_id: int) -> ProgressSnapshot:
    total_lessons = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .count()
    )
    completed_lessons = (
        db.query(func.count(func.distinct(Lesson.id)))
        .join(Module, Lesson.module_id == Module.id)
        .join(Assignment, Assignment.lesson_id == Lesson.id, isouter=True)
        .join(Submission, Submission.assignment_id == Assignment.id, isouter=True)
        .filter(Module.course_id == course_id)
        .filter(Submission.student_id == student_id)
        .filter(Submission.status.in_([SubmissionStatus.submitted, SubmissionStatus.checked]))
        .scalar()
        or 0
    )
    avg_score = (
        db.query(func.avg(Submission.score))
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Lesson, Assignment.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id, Submission.student_id == student_id)
        .scalar()
    )
    snapshot = ProgressSnapshot(
        student_id=student_id,
        course_id=course_id,
        completed_lessons_count=completed_lessons,
        total_lessons_count=total_lessons,
        avg_score=avg_score,
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


@router.get("/my", response_model=List[ProgressSnapshotRead], summary="Progress snapshots across courses")
def list_my_progress(current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    snapshots = db.query(ProgressSnapshot).filter(ProgressSnapshot.student_id == current_user.id).all()
    return snapshots


@router.get("/my/{course_id}", response_model=ProgressSnapshotRead, summary="Progress snapshot for a specific course")
def get_progress(course_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    snapshot = (
        db.query(ProgressSnapshot)
        .filter(ProgressSnapshot.student_id == current_user.id, ProgressSnapshot.course_id == course_id)
        .first()
    )
    if snapshot:
        return snapshot
    return calculate_progress(db, current_user.id, course_id)
