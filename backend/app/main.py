from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import router
from app.core.config import load_settings
from app.core.errors import install_errors
from app.core.logging import configure_logging, install_http_logging
from app.db.session import build_engine
from app.experiments_api import router as experiments_router
from app.metrics_api import router as metrics_router
from app.monitor_api import router as monitor_router
from app.recommendations_api import router as recommendations_router
from app.reports_api import router as reports_router
from app.schemas import ApiError, HealthResponse


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    application.state.settings = load_settings()
    configure_logging()
    application.state.engine = build_engine(
        application.state.settings.database_url.get_secret_value()
    )
    try:
        yield
    finally:
        application.state.engine.dispose()


def create_app() -> FastAPI:
    application = FastAPI(title="NEXO 2031", version="0.1.0", lifespan=lifespan)
    install_http_logging(application)
    install_errors(application)
    application.include_router(router)
    application.include_router(metrics_router)
    application.include_router(monitor_router)
    application.include_router(recommendations_router)
    application.include_router(experiments_router)
    application.include_router(reports_router)

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
