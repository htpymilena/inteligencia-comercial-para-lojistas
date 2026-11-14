"""Real HTTP smoke without a database; child server receives synthetic config only."""

import os
import socket
import subprocess
import sys
import time

import httpx


def test_uvicorn_health_and_unauthenticated_api():
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    environment = os.environ.copy()
    environment["DATABASE_URL"] = "postgresql+psycopg://test:test@127.0.0.1:1/test"
    environment["JWT_SECRET"] = "synthetic-only-smoke-key-at-least-32-bytes"
    environment["PYTHONDONTWRITEBYTECODE"] = "1"
    with subprocess.Popen(
        [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            str(port),
            "--no-access-log",
        ],
        env=environment,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ) as process:
        try:
            deadline = time.monotonic() + 20
            with httpx.Client(base_url=f"http://127.0.0.1:{port}", trust_env=False) as client:
                while True:
                    assert process.poll() is None, "Servidor de smoke encerrou prematuramente"
                    try:
                        response = client.get("/health")
                        break
                    except httpx.ConnectError:
                        assert time.monotonic() < deadline, "Timeout no startup do smoke"
                        time.sleep(0.1)
                assert response.status_code == 200
                assert response.json() == {"status": "ok", "service": "nexo-api"}
                assert client.get("/api/v1/auth/me").status_code == 401
                assert client.get("/api/v1/stores").status_code == 401
        finally:
            process.terminate()
            process.wait(timeout=10)
