from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://chapters:chapters@localhost:5432/chapters_admin"
    SECRET_KEY: str = "change-me-to-a-random-secret-key"
    ENCRYPTION_KEY: str = "change-me-to-a-32-byte-base64-key"
    ADMIN_EMAIL: str = "admin@chaptersgroup.com"
    ADMIN_PASSWORD: str = "changeme123"
    HEALTH_CHECK_INTERVAL: int = 60
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    ALGORITHM: str = "HS256"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
