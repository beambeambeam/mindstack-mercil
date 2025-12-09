"""
Centralized logging configuration for FastAPI application.
Implements structured logging, log rotation, and best practices.
"""

import json
import logging
import sys
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from pathlib import Path
from typing import Any

from .settings import settings


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data: dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        if hasattr(record, "extra") and record.extra:
            log_data.update(record.extra)

        return json.dumps(log_data, default=str)


class StandardFormatter(logging.Formatter):
    """Standard human-readable formatter."""

    def __init__(self) -> None:
        super().__init__(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )


def setup_logging() -> None:
    """Configure application-wide logging."""
    log_level = getattr(settings, "log_level", "INFO").upper()
    log_format = getattr(settings, "log_format", "standard").lower()
    log_file = getattr(settings, "log_file", None)
    log_rotation = getattr(settings, "log_rotation", "size").lower()
    log_max_bytes = getattr(settings, "log_max_bytes", 10 * 1024 * 1024)
    log_backup_count = getattr(settings, "log_backup_count", 5)
    log_when = getattr(settings, "log_when", "midnight")
    log_interval = getattr(settings, "log_interval", 1)

    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level, logging.INFO))

    handlers: list[logging.Handler] = []

    if log_format == "json":
        formatter: logging.Formatter = JSONFormatter()
    else:
        formatter = StandardFormatter()

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(getattr(logging, log_level, logging.INFO))
    handlers.append(console_handler)

    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        if log_rotation == "time":
            file_handler = TimedRotatingFileHandler(
                filename=str(log_path),
                when=log_when,
                interval=log_interval,
                backupCount=log_backup_count,
                encoding="utf-8",
            )
        else:
            file_handler = RotatingFileHandler(
                filename=str(log_path),
                maxBytes=log_max_bytes,
                backupCount=log_backup_count,
                encoding="utf-8",
            )

        file_handler.setFormatter(formatter)
        file_handler.setLevel(getattr(logging, log_level, logging.INFO))
        handlers.append(file_handler)

    for handler in handlers:
        root_logger.addHandler(handler)

    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for a module."""
    return logging.getLogger(name)
