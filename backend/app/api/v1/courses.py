from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_student
from app.db.session import get_db
from app.models.course import Course, Enrollment, Lesson, Module
from app.schemas.course import CourseDetail, CourseRead, ModuleRead

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=Dict[str, List[CourseRead]], summary="Courses for current student")
def list_courses(current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    enrolled_ids = [
        enrollment.course_id for enrollment in db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()
    ]
    enrolled_courses = db.query(Course).filter(Course.id.in_(enrolled_ids)).all() if enrolled_ids else []
    available_query = db.query(Course).filter(Course.is_published.is_(True))
    if enrolled_ids:
        available_query = available_query.filter(Course.id.notin_(enrolled_ids))
    available_courses = available_query.all()
    return {
        "enrolled": [CourseRead.from_orm(course) for course in enrolled_courses],
        "available": [CourseRead.from_orm(course) for course in available_courses],
    }


@router.post("/{course_id}/enroll", response_model=CourseRead, summary="Enroll current student into a course")
def enroll_in_course(course_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id, Course.is_published.is_(True)).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    existing = (
        db.query(Enrollment)
        .filter(Enrollment.course_id == course_id, Enrollment.student_id == current_user.id)
        .first()
    )
    if existing:
        return CourseRead.from_orm(course)
    enrollment = Enrollment(course_id=course_id, student_id=current_user.id)
    db.add(enrollment)
    db.commit()
    return CourseRead.from_orm(course)


@router.get("/{course_id}", response_model=CourseDetail, summary="Detailed course view with modules")
def get_course(course_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    modules = db.query(Module).filter(Module.course_id == course_id).order_by(Module.order_index).all()
    lessons_count = (
        db.query(Lesson).join(Module).filter(Module.course_id == course_id).count()
    )
    assignments_count = db.execute(
        text(
            """
            SELECT COUNT(a.id) FROM assignments a
            JOIN lessons l ON a.lesson_id = l.id
            JOIN modules m ON l.module_id = m.id
            WHERE m.course_id = :course_id
            """
        ),
        {"course_id": course_id},
    ).scalar() or 0
    course_detail = CourseDetail.from_orm(course)
    course_detail.modules = [ModuleRead.from_orm(m) for m in modules]  # type: ignore
    course_detail.lessons_count = lessons_count  # type: ignore
    course_detail.assignments_count = assignments_count  # type: ignore
    return course_detail


@router.get("/{course_id}/structure", summary="Modules and lessons tree for navigation")
def course_structure(course_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    modules = (
        db.query(Module)
        .filter(Module.course_id == course_id)
        .order_by(Module.order_index)
        .all()
    )
    lessons = db.query(Lesson).join(Module).filter(Module.course_id == course_id).all()
    lessons_by_module: Dict[int, List[Lesson]] = {}
    for lesson in lessons:
        lessons_by_module.setdefault(lesson.module_id, []).append(lesson)
    structure: List[Dict[str, Any]] = []
    for module in modules:
        structure.append(
            {
                "id": module.id,
                "title": module.title,
                "order_index": module.order_index,
                "lessons": sorted(
                    [
                        {
                            "id": l.id,
                            "title": l.title,
                            "short_description": l.short_description,
                            "order_index": l.order_index,
                        }
                        for l in lessons_by_module.get(module.id, [])
                    ],
                    key=lambda item: item["order_index"],
                ),
            }
        )
    return {"course_id": course_id, "modules": structure}
