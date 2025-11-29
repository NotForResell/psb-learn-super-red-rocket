import os
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_student
from app.core.config import settings
from app.db.session import get_db
from app.models.assignment import Assignment, Submission, SubmissionFile, SubmissionStatus

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.get("/my", summary="List submissions of the current student")
def list_my_submissions(current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    submissions = db.query(Submission).filter(Submission.student_id == current_user.id).all()
    return submissions


@router.post("", summary="Create or update a submission with optional files")
async def submit_assignment(
    assignment_id: int,
    student_comment: Optional[str] = None,
    files: Optional[List[UploadFile]] = File(None),
    current_user=Depends(get_current_student),
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    now = datetime.utcnow()
    existing_count = (
        db.query(func.count(Submission.id))
        .filter(Submission.assignment_id == assignment_id, Submission.student_id == current_user.id)
        .scalar()
        or 0
    )
    attempt_number = existing_count + 1
    submission = Submission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        attempt_number=attempt_number,
        status=SubmissionStatus.submitted,
        student_comment=student_comment,
        submitted_at=now,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    if files:
        submission_dir = os.path.join(settings.media_root, "submissions", str(submission.id))
        os.makedirs(submission_dir, exist_ok=True)
        for upload in files:
            file_location = os.path.join(submission_dir, upload.filename)
            with open(file_location, "wb") as f:
                f.write(await upload.read())
            submission_file = SubmissionFile(
                submission_id=submission.id,
                file_path=file_location.replace(settings.media_root, "").lstrip(os.sep),
                original_name=upload.filename,
                content_type=upload.content_type or "application/octet-stream",
            )
            db.add(submission_file)
        db.commit()
        db.refresh(submission)
    db.refresh(submission)
    return submission


@router.get("/{submission_id}", summary="Get submission detail for student")
def get_submission(submission_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    if submission.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return submission


@router.get("/files/{file_id}/download", response_class=FileResponse, summary="Download submission file")
def download_submission_file(file_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    submission_file = db.query(SubmissionFile).filter(SubmissionFile.id == file_id).first()
    if not submission_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    submission = db.query(Submission).filter(Submission.id == submission_file.submission_id).first()
    if not submission or submission.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    absolute_path = os.path.join(settings.media_root, submission_file.file_path)
    if not os.path.exists(absolute_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File missing on server")
    return FileResponse(absolute_path, media_type=submission_file.content_type, filename=submission_file.original_name)
