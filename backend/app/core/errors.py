from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException


class DomainError(Exception):
    def __init__(self, status: int, code: str, message: str) -> None:
        self.status, self.code, self.message = status, code, message


def error_response(request: Request, status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "error": {"code": code, "message": message, "details": None},
            "request_id": request.state.request_id,
        },
    )


def install_errors(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def domain(request: Request, error: DomainError) -> JSONResponse:
        return error_response(request, error.status, error.code, error.message)

    @app.exception_handler(RequestValidationError)
    async def validation(request: Request, error: RequestValidationError) -> JSONResponse:
        return error_response(request, 422, "VALIDATION_ERROR", "Dados inválidos")

    @app.exception_handler(HTTPException)
    async def http(request: Request, error: HTTPException) -> JSONResponse:
        codes = {401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND"}
        return error_response(
            request,
            error.status_code,
            codes.get(error.status_code, "HTTP_ERROR"),
            "Requisição recusada",
        )
