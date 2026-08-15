"""
Lightweight SQLite-backed log of every AI provider call (provider, model,
tokens, latency, cost estimate, validation status).

This is NOT the source of truth for AI usage — per docs/architecture-plan.md
SS F/H, the main backend's `ai_requests`/`ai_responses` Postgres tables are
that source of truth, populated from the response this service returns. This
log exists only so the gateway itself has local visibility/debugging without
a shared DB connection to the backend.
"""
from __future__ import annotations

import sqlite3
import threading
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass
class RequestLogEntry:
    ai_request_id: str
    task_type: str
    provider: str
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    cost_estimate_usd: float
    mock: bool
    validation_ok: bool


class RequestLog:
    def __init__(self, db_path: str) -> None:
        self._db_path = db_path
        self._lock = threading.Lock()
        self._init_schema()

    @contextmanager
    def _connect(self):
        conn = sqlite3.connect(self._db_path)
        try:
            yield conn
        finally:
            conn.close()

    def _init_schema(self) -> None:
        with self._lock, self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS request_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ai_request_id TEXT NOT NULL,
                    task_type TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    model TEXT NOT NULL,
                    input_tokens INTEGER NOT NULL,
                    output_tokens INTEGER NOT NULL,
                    latency_ms REAL NOT NULL,
                    cost_estimate_usd REAL NOT NULL,
                    mock INTEGER NOT NULL,
                    validation_ok INTEGER NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def record(self, entry: RequestLogEntry) -> None:
        with self._lock, self._connect() as conn:
            conn.execute(
                """
                INSERT INTO request_log (
                    ai_request_id, task_type, provider, model,
                    input_tokens, output_tokens, latency_ms,
                    cost_estimate_usd, mock, validation_ok, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entry.ai_request_id,
                    entry.task_type,
                    entry.provider,
                    entry.model,
                    entry.input_tokens,
                    entry.output_tokens,
                    entry.latency_ms,
                    entry.cost_estimate_usd,
                    int(entry.mock),
                    int(entry.validation_ok),
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            conn.commit()

    def recent(self, limit: int = 50) -> list[dict]:
        with self._lock, self._connect() as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(
                "SELECT * FROM request_log ORDER BY id DESC LIMIT ?", (limit,)
            ).fetchall()
            return [dict(row) for row in rows]
