from datetime import datetime, timedelta

from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.assignment import Assignment, Submission, SubmissionStatus
from app.models.course import Course, Enrollment, Lesson, Module
from app.models.progress import ProgressSnapshot
from app.models.user import User, UserRole
from app.models.test import Test, TestQuestion, TestOption, QuestionType
from app.models.chat import ChatMessage


def init_db() -> None:
    """Create tables and seed demo data if missing."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        teacher = db.query(User).filter(User.email == "teacher@example.com").first()
        student = db.query(User).filter(User.email == "student@example.com").first()

        if not teacher:
            teacher = User(
                email="teacher@example.com",
                full_name="Demo Teacher",
                role=UserRole.teacher,
                hashed_password=get_password_hash("password"),
            )
            db.add(teacher)
        if not student:
            student = User(
                email="student@example.com",
                full_name="Demo Student",
                role=UserRole.student,
                hashed_password=get_password_hash("student123"),
            )
            db.add(student)
        else:
            student.hashed_password = get_password_hash("student123")
        db.commit()
        db.refresh(teacher)
        db.refresh(student)

        course = db.query(Course).filter(Course.title == "Python Basics").first()
        assignment1 = None
        assignment2 = None
        if not course:
            course = Course(
                title="Python Basics",
                short_description="Быстрый старт в программировании на Python.",
                long_description="Курс для студентов без опыта: переменные, функции, работа с данными и простые проекты.",
                level="beginner",
                tags="python,basics",
                estimated_hours=12,
                is_published=True,
                owner_id=teacher.id,
            )
            db.add(course)
            db.commit()
            db.refresh(course)

            module1 = Module(course_id=course.id, title="Введение и базовый синтаксис", order_index=1)
            module2 = Module(course_id=course.id, title="Работа с данными", order_index=2)
            db.add_all([module1, module2])
            db.commit()
            db.refresh(module1)
            db.refresh(module2)

            lesson1 = Lesson(
                module_id=module1.id,
                title="Первая программа",
                short_description="Разбираемся с установкой, выводом на экран и базовыми операторами.",
                content_html="<p>Напишите программу, которая выводит ваше имя. Изучите функцию print и типы данных.</p>",
                order_index=1,
            )
            lesson2 = Lesson(
                module_id=module1.id,
                title="Условия и циклы",
                short_description="Как повторять действия и принимать решения в коде.",
                content_html="<p>Изучите if/else и for/while. Создайте программу-опросник.</p>",
                order_index=2,
            )
            lesson3 = Lesson(
                module_id=module2.id,
                title="Списки и словари",
                short_description="Храним и обрабатываем коллекции данных.",
                content_html="<p>Попробуйте создать список оценок и словарь с данными студента.</p>",
                order_index=1,
            )
            db.add_all([lesson1, lesson2, lesson3])
            db.commit()
            db.refresh(lesson1)
            db.refresh(lesson2)
            db.refresh(lesson3)

            assignment1 = Assignment(
                lesson_id=lesson2.id,
                title="Опросник в консоли",
                description="Сделайте консольный опросник с 5 вопросами и подведите итоги.",
                max_score=10,
                due_date=datetime.utcnow() + timedelta(days=7),
            )
            assignment2 = Assignment(
                lesson_id=lesson3.id,
                title="Каталог студентов",
                description="Сохраните информацию о студентах в списке словарей и выведите рейтинг.",
                max_score=15,
                due_date=datetime.utcnow() + timedelta(days=10),
            )
            db.add_all([assignment1, assignment2])
            db.commit()
            db.refresh(assignment1)
            db.refresh(assignment2)
            # тест для демо
            demo_test = Test(
                course_id=course.id,
                title="Базовый тест по Python",
                description="Короткая проверка знаний по материалам курса.",
                time_limit_minutes=15,
                is_published=True,
            )
            db.add(demo_test)
            db.commit()
            db.refresh(demo_test)
            q1 = TestQuestion(
                test_id=demo_test.id,
                text="Как вывести текст в консоль?",
                type=QuestionType.single,
                order_index=1,
            )
            q2 = TestQuestion(
                test_id=demo_test.id,
                text="Выберите неизменяемые типы данных.",
                type=QuestionType.multiple,
                order_index=2,
            )
            db.add_all([q1, q2])
            db.commit()
            db.refresh(q1)
            db.refresh(q2)
            db.add_all(
                [
                    TestOption(question_id=q1.id, text="print()", is_correct=True),
                    TestOption(question_id=q1.id, text="echo()", is_correct=False),
                    TestOption(question_id=q2.id, text="tuple", is_correct=True),
                    TestOption(question_id=q2.id, text="list", is_correct=False),
                    TestOption(question_id=q2.id, text="str", is_correct=True),
                ]
            )
            db.commit()
        else:
            assignment1 = (
                db.query(Assignment)
                .join(Lesson, Assignment.lesson_id == Lesson.id)
                .join(Module, Lesson.module_id == Module.id)
                .filter(Module.course_id == course.id)
                .order_by(Assignment.id)
                .first()
            )
            assignment2 = (
                db.query(Assignment)
                .join(Lesson, Assignment.lesson_id == Lesson.id)
                .join(Module, Lesson.module_id == Module.id)
                .filter(Module.course_id == course.id)
                .order_by(Assignment.id.desc())
                .first()
            )

        enrollment = (
            db.query(Enrollment)
            .filter(Enrollment.course_id == course.id, Enrollment.student_id == student.id)
            .first()
        )
        if not enrollment:
            enrollment = Enrollment(course_id=course.id, student_id=student.id)
            db.add(enrollment)
            db.commit()

        if assignment1:
            submission = (
                db.query(Submission)
                .filter(Submission.assignment_id == assignment1.id, Submission.student_id == student.id)
                .first()
            )
            if not submission:
                submission = Submission(
                    assignment_id=assignment1.id,
                    student_id=student.id,
                    attempt_number=1,
                    status=SubmissionStatus.checked,
                    student_comment="Готов к фидбеку!",
                    teacher_comment="Хорошее начало, добавьте обработку пустого ввода.",
                    submitted_at=datetime.utcnow() - timedelta(days=1),
                    checked_at=datetime.utcnow(),
                    score=9.5,
                )
                db.add(submission)
                db.commit()

        progress = (
            db.query(ProgressSnapshot)
            .filter(ProgressSnapshot.student_id == student.id, ProgressSnapshot.course_id == course.id)
            .first()
        )
        if not progress:
            progress = ProgressSnapshot(
                student_id=student.id,
                course_id=course.id,
                completed_lessons_count=2,
                total_lessons_count=3,
                avg_score=9.5,
            )
            db.add(progress)
            db.commit()
        # приветственное сообщение в чат
        if (
            db.query(ChatMessage)
            .filter(ChatMessage.course_id == course.id)
            .count()
            == 0
        ):
            msg = ChatMessage(
                course_id=course.id,
                author_id=teacher.id,
                text="Добро пожаловать в курс! Используйте чат для вопросов.",
                is_teacher=True,
                created_at=datetime.utcnow(),
            )
            db.add(msg)
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
