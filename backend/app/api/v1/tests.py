from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_student, get_current_teacher
from app.db.session import get_db
from app.models.course import Course, Enrollment
from app.models.test import (
    Test,
    TestAttempt,
    TestQuestion,
    TestOption,
    TestAnswer,
    QuestionType,
)
from app.schemas.test import (
    TestListResponse,
    TestSummary,
    TestRead,
    TestQuestionRead,
    TestAttemptListResponse,
    TestAttemptResult,
    TestSubmitPayload,
    TestSubmitResult,
    TestCreate,
    TestQuestionCreate,
)

router = APIRouter(prefix="", tags=["tests"])


def ensure_student_enrolled(db: Session, student_id: int, course_id: int) -> None:
    if (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student_id, Enrollment.course_id == course_id)
        .first()
        is None
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нет доступа к курсу")


@router.get("/courses/{course_id}/tests", response_model=TestListResponse, summary="Тесты курса")
def list_tests_for_course(course_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    ensure_student_enrolled(db, current_user.id, course_id)
    tests = (
        db.query(Test)
        .filter(Test.course_id == course_id, Test.is_published.is_(True))
        .order_by(Test.created_at.desc())
        .all()
    )
    items = [
        TestSummary(
            id=test.id,
            title=test.title,
            description=test.description,
            time_limit_minutes=test.time_limit_minutes,
        )
        for test in tests
    ]
    return TestListResponse(items=items)


@router.get("/tests/{test_id}", response_model=TestRead, summary="Получить тест с вопросами")
def get_test(test_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.is_published.is_(True)).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тест не найден")
    ensure_student_enrolled(db, current_user.id, test.course_id)
    # options include only text/id in schema, так что флаги корректности не утекут
    return TestRead.from_orm(test)


@router.get("/tests/{test_id}/attempts/my", response_model=TestAttemptListResponse, summary="Попытки теста текущего студента")
def get_my_attempts(test_id: int, current_user=Depends(get_current_student), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тест не найден")
    ensure_student_enrolled(db, current_user.id, test.course_id)
    attempts = (
        db.query(TestAttempt)
        .filter(TestAttempt.test_id == test_id, TestAttempt.student_id == current_user.id)
        .order_by(TestAttempt.started_at.desc())
        .all()
    )
    return TestAttemptListResponse(items=[TestAttemptResult.from_orm(a) for a in attempts])


@router.post("/tests/{test_id}/submit", response_model=TestSubmitResult, summary="Отправить ответы на тест")
def submit_test(
    test_id: int,
    payload: TestSubmitPayload,
    current_user=Depends(get_current_student),
    db: Session = Depends(get_db),
):
    test = db.query(Test).filter(Test.id == test_id, Test.is_published.is_(True)).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тест не найден")
    ensure_student_enrolled(db, current_user.id, test.course_id)
    questions: List[TestQuestion] = (
        db.query(TestQuestion)
        .filter(TestQuestion.test_id == test_id)
        .order_by(TestQuestion.order_index)
        .all()
    )
    if not questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="В тесте нет вопросов")

    question_map = {q.id: q for q in questions}
    attempt = TestAttempt(test_id=test_id, student_id=current_user.id, started_at=datetime.utcnow())
    db.add(attempt)
    db.flush()

    correct_score = 0
    max_score = len(questions)

    for answer_payload in payload.answers:
        question = question_map.get(answer_payload.question_id)
        if not question:
            continue
        selected_option_ids = set(answer_payload.selected_option_ids)
        # сохраняем ответы
        for option_id in selected_option_ids:
            option = db.query(TestOption).filter(TestOption.id == option_id, TestOption.question_id == question.id).first()
            if not option:
                continue
            db.add(TestAnswer(attempt_id=attempt.id, question_id=question.id, option_id=option.id))

        correct_options = {
            opt.id
            for opt in db.query(TestOption).filter(TestOption.question_id == question.id, TestOption.is_correct.is_(True))
        }
        if question.type == QuestionType.single:
            if len(selected_option_ids) == 1 and selected_option_ids == correct_options:
                correct_score += 1
        else:
            if selected_option_ids == correct_options and len(correct_options) > 0:
                correct_score += 1

    attempt.finished_at = datetime.utcnow()
    attempt.score = float(correct_score)
    attempt.max_score = max_score
    db.commit()
    db.refresh(attempt)
    return TestSubmitResult(attempt_id=attempt.id, score=attempt.score, max_score=max_score)


# --------- маршруты для преподавателя ---------


@router.post("/courses/{course_id}/tests", response_model=TestSummary, summary="Создать тест (преподаватель)")
def create_test(
    course_id: int,
    payload: TestCreate,
    current_user=Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Курс не найден")
    test = Test(
        course_id=course_id,
        title=payload.title,
        description=payload.description,
        time_limit_minutes=payload.time_limit_minutes,
        is_published=payload.is_published,
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return TestSummary.from_orm(test)


@router.post("/tests/{test_id}/questions", response_model=TestRead, summary="Добавить вопрос (преподаватель)")
def add_question(
    test_id: int,
    payload: TestQuestionCreate,
    current_user=Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Тест не найден")
    question = TestQuestion(
        test_id=test_id,
        text=payload.text,
        type=payload.type,
        order_index=payload.order_index,
    )
    db.add(question)
    db.flush()
    for opt_payload in payload.options:
        db.add(TestOption(question_id=question.id, text=opt_payload.text, is_correct=opt_payload.is_correct))
    db.commit()
    db.refresh(test)
    return TestRead.from_orm(test)
