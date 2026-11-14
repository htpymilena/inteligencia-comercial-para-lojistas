# M05 — desenvolvimento experimental

Implementados revision 005, criação 201 vinculada a recomendação ACCEPTED da mesma loja, listagem/detalhe, estados com CAS status/version e resultado com cobertura diária completa. Seed opcional de experimento não adicionada; fixtures e API criam o ciclo.

Autorização atual: desenvolvimento independente antes da integração; branch experimental/backend-m01-m08. Gates permanecem PENDENTES. Dependências usadas são as implementações experimentais anteriores; não main integrada.

Com Python 3.12.10 da .venv, comandos em backend/:

- python -m pytest -q: **49 passed, 11 skipped**. Skips SQL por TEST_DATABASE_URL ausente.
- python -m ruff check --fix --no-cache .: passou após ajustes de formatação/imports.
- python -m mypy: passou (39 arquivos).
- Lint OpenAPI normativo/runtime e comparação estrutural das operações implementadas passaram dentro da suite contract.

Unitários cobrem quatro transições válidas, inválidas/terminais, título/datas e comparação completa/incompleta/não concluída. Integração preparada percorre aceitar→criar→iniciar→concluir→resultado; ainda depende de PostgreSQL.

Pendências: aplicar migrations e executar testes HTTP/seed/constraints/concorrência em PostgreSQL 16 exclusivo; validar fluxo integrado com FRONT/equipe. Nenhum resultado SQL é presumido. Aviso Starlette/AnyIO BlockingPortal não bloqueante. Não houve push/merge.
