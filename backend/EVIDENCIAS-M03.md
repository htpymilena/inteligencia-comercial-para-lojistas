# M03 — desenvolvimento experimental

Implementados models/revision 003, DTOs validados, quatro consultas autorizadas e seed sintética de câmeras, snapshot, zonas e sete dias de grade 10×8.

Autorização atual: desenvolvimento independente antes da integração; branch experimental/backend-m01-m08. Gates permanecem PENDENTES. Dependências usadas são as implementações experimentais anteriores; não main integrada.

Com Python 3.12.10 da .venv, comandos em backend/:

- python -m pytest -q: **32 passed, 8 skipped**. Skips SQL por TEST_DATABASE_URL ausente.
- python -m ruff check --fix --no-cache .: passou após ajustes de formatação/imports.
- python -m mypy: passou (28 arquivos).
- Lint OpenAPI normativo/runtime e comparação estrutural das operações implementadas passaram dentro da suite contract.

Unitários cobrem limites de grade/intensidade, zona contida, DEMO e ocupação. Integração preparada cobre 80 células, vazios, snapshot ausente, isolamento e seed dupla; ainda não executada.

Pendências: aplicar migrations e executar testes HTTP/seed/constraints/concorrência em PostgreSQL 16 exclusivo; validar fluxo integrado com FRONT/equipe. Nenhum resultado SQL é presumido. Aviso Starlette/AnyIO BlockingPortal não bloqueante. Não houve push/merge.
