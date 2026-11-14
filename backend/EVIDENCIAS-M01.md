# M01 — entrega experimental

## Revalidação local posterior — 14/11/2026

Em projeto Compose isolado com PostgreSQL 16, os testes montados no contêiner
Python 3.12 foram executados com `TEST_DATABASE_URL` exclusiva de teste:
`python -m pytest tests/integration -q` resultou em **14 passed, 3 warnings**,
sem skips. O fixture aplicou a cadeia Alembic até `005` em schema exclusivo.
Dois testes novos confirmam constraints PostgreSQL de email normalizado/único,
papel, FK e timestamp UTC, além de commit, rollback e devolução de conexão do
ciclo de sessão. `ruff check --no-cache tests/integration` passou.
O teste unitário adicional de lifecycle confirmou que `/health` não conecta ao
banco e que o engine é descartado ao encerrar a aplicação (2 passed no arquivo
`test_no_sql.py`, Ruff aprovado).
Os cenários HTTP SQL de login foram ampliados: email normalizado, campos
públicos exatos, senha incorreta/conta ausente com o mesmo 401, conta inativa,
ausência de token e token emitido para usuário removido. `test_identity.py`
aprovou 7 casos com Ruff aprovado. A mesma suíte confirmou ADMIN sem vínculo,
loja inexistente 404, identificador inválido 422, LOJISTA sem vínculos com lista
vazia, recusa após perda do vínculo e papel persistido como autoridade após
emissão do JWT. Respostas e logs não incluíram nomes de lojas recusadas.
A seed de identidade foi testada duas vezes preservando IDs, hashes, contagens
e vínculo. Colisão no segundo registro reservado abortou a transação sem deixar
o primeiro registro nem alterar o externo. A falta de senha foi testada no
comando principal antes de abrir engine. A seleção de `test_identity.py` e
`test_release.py` aprovou 14 casos; Ruff passou.
O teste de integração contratual M01 validou corpos HTTP reais 200/401/403/404/
422 contra os schemas normativos; o teste contratual existente cobre 500 e
compara paths, operationIds, security, status e schemas do runtime M00–M06 ao
YAML normativo. O lint do YAML passou no projeto Compose isolado.

Os resultados de 19 passed/4 skipped abaixo são históricos. G00/G01 continuam
pendentes de revisão formal; essa revalidação não equivale a push ou gate.

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
