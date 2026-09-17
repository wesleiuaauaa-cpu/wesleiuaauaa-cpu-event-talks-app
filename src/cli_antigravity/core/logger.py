import sys
from pathlib import Path

from loguru import logger

CONSOLE_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
    "<level>{message}</level>"
)

FILE_FORMAT = "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"


def setup_logger(log_level: str = "INFO", log_file: Path | None = None) -> None:
    """Configures the Loguru logger with custom formats and sinks."""
    logger.remove()

    # Console sink
    logger.add(
        sys.stderr,
        level=log_level.upper(),
        format=CONSOLE_FORMAT,
        colorize=True,
    )

    # Optional file sink
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        logger.add(
            str(log_file),
            level="DEBUG",
            rotation="10 MB",
            retention="7 days",
            compression="zip",
            format=FILE_FORMAT,
        )
