# M01 — entrega experimental

Autorização atual do usuário/equipe: desenvolvimento independente M01–M06/M08
antes da integração. Branch `experimental/backend-m01-m08`, baseada no BACK M00.
Essa autorização substitui somente as condições de início/branch dos planos;
G00 e demais gates continuam PENDENTES. Não houve merge ou push.

Implementados models, revision 001, seed explícita, Argon2, JWT HS256 (30 min),
perfil e autorização por usuário ativo/vínculo persistidos. Erros ApiError saneados.
Dependências fixadas no manifest/lock, sem alteração de infra compartilhada.

Verificação com Python 3.12.10 da .venv, em backend/:

- `python -m pytest tests/unit tests/contract tests/integration -q`: **19 passed,
  4 skipped**. Testes SQL pulados: TEST_DATABASE_URL ausente nesta sessão.
- `python -m ruff check --no-cache .`: passou.
- `python -m mypy`: passou (18 arquivos).
- `python -m pip check`: passou.
- `python -m alembic heads`: revision 001; não prova migration aplicada.
- Lint OpenAPI 3.1 normativo/runtime e comparação estrutural por operação passam
  dentro da suite contract. Campos, enums, security e status M00+M01 conferidos.

Aviso de depreciação Starlette/AnyIO BlockingPortal, sem falha.
Testes SQL estão preparados para schema PostgreSQL 16 exclusivo, sem DROP/reset.
Faltam execução de migration, seed/isolamento HTTP em PostgreSQL, smoke em processo
servidor externo e integração FRONT/equipe; não declarar M01 totalmente validado.
