# M06 — desenvolvimento experimental

Implementado relatório comparativo autorizado por loja, sem migration nova, reutilizando agregador Decimal e política de disponibilidade do M05. Valores zero e dias ausentes são distintos.

Autorização atual: desenvolvimento independente antes da integração; branch experimental/backend-m01-m08. Gates permanecem PENDENTES. Dependências usadas são as implementações experimentais anteriores; não main integrada.

Com Python 3.12.10 da .venv, comandos em backend/:

- python -m pytest -q: **51 passed, 12 skipped**. Skips SQL por TEST_DATABASE_URL ausente.
- python -m ruff check --fix --no-cache .: passou após ajustes de formatação/imports.
- python -m mypy: passou (42 arquivos).
- Lint OpenAPI normativo/runtime e comparação estrutural das operações implementadas passaram dentro da suite contract.

Unitários do serviço verificam janelas 10–12/11 versus 7–9/11, diferença de 5 p.p., receita string, zero disponível e cobertura parcial com blocos null. Integração preparada cobre HTTP, período vazio e isolamento.

Pendências: aplicar migrations e executar testes HTTP/seed/constraints/concorrência em PostgreSQL 16 exclusivo; validar fluxo integrado com FRONT/equipe. Nenhum resultado SQL é presumido. Aviso Starlette/AnyIO BlockingPortal não bloqueante. Não houve push/merge.
