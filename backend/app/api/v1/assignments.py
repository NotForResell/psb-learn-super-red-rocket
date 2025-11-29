from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_student
from app.db.session import get_db
from app.models.assignment import Assignment, Submission
from app.schemas.assignment import SubmissionListResponse

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("/by-lesson/{lesson_id}", summary="Get assignment for a lesson")
def get_assignment_by_lesson(lesson_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.lesson_id == lesson_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return assignment


@router.get("/{assignment_id}", summary="Assignment details with student submission")
def get_assignment(assignment_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    submission = (
        db.query(Submission)
        .filter(Submission.assignment_id == assignment_id, Submission.student_id == current_user.id)
        .order_by(Submission.attempt_number.desc(), Submission.submitted_at.desc())
        .first()
    )
    return {"assignment": assignment, "submission": submission}


@router.get(
    "/{assignment_id}/my-submissions",
    response_model=SubmissionListResponse,
    summary="List submissions for assignment of current student",
)
def list_submissions_for_assignment(
    assignment_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    submissions = (
        db.query(Submission)
        .filter(Submission.assignment_id == assignment_id, Submission.student_id == current_user.id)
        .order_by(Submission.attempt_number.desc(), Submission.submitted_at.desc())
        .all()
    )
    return {"items": submissions}
