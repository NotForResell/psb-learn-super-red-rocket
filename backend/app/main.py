import os

from app.core.version_check import verify_dependencies

verify_dependencies()

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import (
    assignments,
    auth,
    courses,
    lessons,
    progress,
    submissions,
    users,
    grades,
    deadlines,
    feed,
    tests,
    chat,
)
from app.core.config import settings

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(courses.router)
api_router.include_router(lessons.router)
api_router.include_router(assignments.router)
api_router.include_router(submissions.router)
api_router.include_router(progress.router)
api_router.include_router(grades.router)
api_router.include_router(deadlines.router)
api_router.include_router(feed.router)
api_router.include_router(tests.router)
api_router.include_router(chat.router)


def create_app() -> FastAPI:
    app = FastAPI(
        title="PSB Learn API",
        description="Student track API for PSB Learn hackathon prototype.",
        version="0.1.0",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def ensure_media_folder() -> None:
        os.makedirs(settings.media_root, exist_ok=True)

    @app.get("/health", tags=["health"])
    def health_check():
        return {"status": "ok"}

    app.include_router(api_router)
    return app


app = create_app()
