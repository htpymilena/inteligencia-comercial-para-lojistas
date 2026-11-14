# M04 — desenvolvimento experimental

Implementados revision 004, listagem filtrada e PATCH com transição atômica por status/version, seed explicável RULE_BASED_DEMO e preservação de decisões.

Autorização atual: desenvolvimento independente antes da integração; branch experimental/backend-m01-m08. Gates permanecem PENDENTES. Dependências usadas são as implementações experimentais anteriores; não main integrada.

Com Python 3.12.10 da .venv, comandos em backend/:

- python -m pytest -q: **38 passed, 10 skipped**. Skips SQL por TEST_DATABASE_URL ausente.
- python -m ruff check --fix --no-cache .: passou após ajustes de formatação/imports.
- python -m mypy: passou (33 arquivos).
- Lint OpenAPI normativo/runtime e comparação estrutural das operações implementadas passaram dentro da suite contract.

Unitários verificam transições permitidas e terminais 409. Contrato detectou e corrigiu nullable indevido no filtro opcional status. Integração preparada inclui persistência, seed dupla, IDOR e duas sessões concorrentes; execução PostgreSQL pendente.

Pendências: aplicar migrations e executar testes HTTP/seed/constraints/concorrência em PostgreSQL 16 exclusivo; validar fluxo integrado com FRONT/equipe. Nenhum resultado SQL é presumido. Aviso Starlette/AnyIO BlockingPortal não bloqueante. Não houve push/merge.
