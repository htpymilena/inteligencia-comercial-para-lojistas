from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import load_settings
from app.core.logging import configure_logging, install_http_logging
from app.schemas import ApiError, HealthResponse


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    application.state.settings = load_settings()
    configure_logging()
    yield


def create_app() -> FastAPI:
    application = FastAPI(title="NEXO 2031", version="0.1.0", lifespan=lifespan)
    install_http_logging(application)

    @application.get(
        "/health",
        operation_id="verificarSaude",
        response_model=HealthResponse,
        responses={500: {"model": ApiError}},
        tags=["Health"],
        openapi_extra={"security": [], "x-mvp-module": "M00"},
    )
    def health() -> HealthResponse:
        return HealthResponse(status="ok", service="nexo-api")

    return application


app = create_app()
