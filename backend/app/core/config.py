from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str = Field(
        "postgresql+psycopg2://psb_user:psb_pass@localhost:5432/psb_learn",
        env="DATABASE_URL",
    )
    jwt_secret_key: str = Field("changeme", env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(60, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    media_root: str = Field("/app/media", env="MEDIA_ROOT")

    class Config:
        case_sensitive = False
        env_file = ".env"


settings = Settings()
