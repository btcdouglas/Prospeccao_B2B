from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[3]
ENV_FILE = ROOT_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    DATABASE_URL: str = ""
    REDIS_URL: str = ""
    SECRET_KEY: str = ""
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    APOLLO_API_KEY: str = ""
    PDL_API_KEY: str = ""
    CLEARBIT_API_KEY: str = ""
    SENDGRID_API_KEY: str = ""
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000


settings = Settings()