# M08 — desenvolvimento experimental

Implementada verificação de entrega experimental: regressão de autorização antes de SQL, papel persistido após JWT, recusa de expiração infinita, coerência de constraint email e protocolo documentado de reprodução/backup. M08 permanece parcial pela ausência de execução SQL e restauração real.

Autorização atual: desenvolvimento independente antes da integração; branch experimental/backend-m01-m08. Gates permanecem PENDENTES. Dependências usadas são as implementações experimentais anteriores; não main integrada.

Com Python 3.12.10 da .venv, comandos em backend/:

- python -m pytest -q: **58 passed, 12 skipped**. Skips SQL por TEST_DATABASE_URL ausente.
- python -m ruff check --fix --no-cache .: passou após ajustes de formatação/imports.
- python -m mypy: passou (42 arquivos).
- Lint OpenAPI normativo/runtime e comparação estrutural das operações implementadas passaram dentro da suite contract.

Smoke com subprocesso Uvicorn e HTTP real: /health 200 e APIs sem autenticação 401. Scripts Alembic upgrade e downgrade compilados offline, sem executar SQL; revision head 005. Pip check passou. Os sete planejamentos passaram em OpenSpec --strict. Avisos: Starlette/AnyIO BlockingPortal e Alembic path_separator, sem falhas. Teste de backup/restauração não executado; protocolo em REPRODUCAO.md. Meta de p95 não medida.

Pendências: aplicar migrations e executar testes HTTP/seed/constraints/concorrência em PostgreSQL 16 exclusivo; validar fluxo integrado com FRONT/equipe. Nenhum resultado SQL é presumido. Aviso Starlette/AnyIO BlockingPortal não bloqueante. Não houve push/merge.
