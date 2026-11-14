import json
import logging
import sys
from collections.abc import Awaitable, Callable
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse

from app.schemas import ApiError, ApiErrorDetail

logger = logging.getLogger("nexo.http")


def configure_logging() -> None:
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter("%(message)s"))
        logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def install_http_logging(application: FastAPI) -> None:
    @application.middleware("http")
    async def observe(
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        start = perf_counter()
        request_id = "req_" + uuid4().hex
        try:
            response = await call_next(request)
        except Exception:
            # Never log exception text, SQL, headers, query strings or request bodies.
            body = ApiError(
                error=ApiErrorDetail(
                    code="INTERNAL_ERROR",
                    message="Erro interno do serviço",
                    details=None,
                ),
                request_id=request_id,
            )
            response = JSONResponse(status_code=500, content=body.model_dump())
        response.headers["X-Request-ID"] = request_id
        route = request.scope.get("route")
        logger.info(
            json.dumps(
                {
                    "request_id": request_id,
                    "method": request.method,
                    "route": getattr(route, "path", "<unmatched>"),
                    "status": response.status_code,
                    "duration_ms": round((perf_counter() - start) * 1000, 3),
                }
            )
        )
        return response
