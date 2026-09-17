from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings and environment configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Cli Antigravity"
    app_env: Literal["development", "staging", "production"] = "development"
    debug: bool = False
    log_level: str = "INFO"
    data_dir: Path = Path.home() / ".cli_antigravity"


settings = Settings()
