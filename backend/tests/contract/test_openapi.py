from copy import deepcopy
from pathlib import Path

import jsonschema
import yaml
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from openapi_spec_validator import validate

from app.main import create_app

CONTRACT = yaml.safe_load(
    (Path(__file__).resolve().parents[3] / "sistema/openapi.yaml").read_text(encoding="utf-8")
)


def normalize(value):
    """Ignore annotation-only differences and normalize singleton enum/const."""
    if isinstance(value, list):
        return [normalize(item) for item in value]
    if not isinstance(value, dict):
        return value
    value = {
        key: normalize(item)
        for key, item in value.items()
        if key not in {"title", "example", "examples", "description"}
    }
    if "const" in value:
        value["enum"] = [value.pop("const")]
    return value


IMPLEMENTED = {"M00", "M01", "M02", "M03"}


def expanded(document, value):
    if isinstance(value, list):
        return [expanded(document, item) for item in value]
    if not isinstance(value, dict):
        return value
    if "$ref" in value:
        node = document
        for part in value["$ref"].removeprefix("#/").split("/"):
            node = node[part]
        return expanded(document, node)
    result = normalize({key: expanded(document, item) for key, item in value.items()})
    if isinstance(result.get("required"), list):
        result["required"] = sorted(result["required"])
    return result


def resolve_response(document, response):
    if "$ref" in response:
        response = document["components"]["responses"][response["$ref"].split("/")[-1]]
    return response["content"]["application/json"]["schema"]


def test_runtime_m00_matches_contract(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    with TestClient(create_app()) as client:
        runtime = client.get("/openapi.json").json()
    validate(CONTRACT)
    validate(runtime)
    expected = {
        path: ops
        for path, ops in CONTRACT["paths"].items()
        if any(op.get("x-mvp-module") in IMPLEMENTED for op in ops.values())
    }
    assert set(runtime["paths"]) == set(expected)
    for path, operations in expected.items():
        assert set(runtime["paths"][path]) == set(operations)
        for method, planned in operations.items():
            actual = runtime["paths"][path][method]
            assert actual["operationId"] == planned["operationId"]
            assert actual.get("security", runtime.get("security")) == planned.get(
                "security", CONTRACT["security"]
            )
            assert set(actual["responses"]) == set(planned["responses"])
            for code in actual["responses"]:
                assert expanded(runtime, resolve_response(runtime, actual["responses"][code])) == (
                    expanded(CONTRACT, resolve_response(CONTRACT, planned["responses"][code]))
                )
            if "requestBody" in planned:
                assert expanded(runtime, actual["requestBody"]) == expanded(
                    CONTRACT, planned["requestBody"]
                )

            def params(doc, op):
                return {
                    (p["name"], p["in"]): (p.get("required", False), p["schema"])
                    for p in expanded(doc, op.get("parameters", []))
                }

            assert params(runtime, actual) == params(CONTRACT, planned)


def test_real_responses_validate_against_normative_schemas(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://test:test@127.0.0.1:1/test")
    app = create_app()
    schema = deepcopy(CONTRACT)
    schema["$ref"] = "#/components/schemas/HealthResponse"
    with TestClient(app) as client:
        jsonschema.Draft202012Validator(schema).validate(client.get("/health").json())

        async def fail(request):
            raise RuntimeError("controlled failure")

        next(r for r in app.routes if isinstance(r, APIRoute) and r.path == "/health").app = fail
        response = client.get("/health")
        assert response.status_code == 500
        schema["$ref"] = "#/components/schemas/ApiError"
        jsonschema.Draft202012Validator(schema).validate(response.json())
