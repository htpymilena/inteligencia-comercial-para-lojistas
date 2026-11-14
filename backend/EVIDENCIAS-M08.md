# M08 — desenvolvimento experimental

Implementada verificação de entrega experimental: regressão de autorização antes de SQL, papel persistido após JWT, recusa de expiração infinita, coerência de constraint email e protocolo documentado de reprodução/backup. Os 12 testes SQL passaram em execução manual informada pelo usuário (registro ao final). M08 permanece parcial por backup/restauração real e validações finais de integração ainda pendentes. Os resultados anteriores abaixo são histórico, não o estado atual da validação SQL.

Autorização atual: desenvolvimento independente antes da integração; branch experimental/backend-m01-m08. Gates permanecem PENDENTES. Dependências usadas são as implementações experimentais anteriores; não main integrada.

Com Python 3.12.10 da .venv, comandos em backend/:

- python -m pytest -q: **58 passed, 12 skipped**. Skips SQL por TEST_DATABASE_URL ausente.
- python -m ruff check --fix --no-cache .: passou após ajustes de formatação/imports.
- python -m mypy: passou (42 arquivos).
- Lint OpenAPI normativo/runtime e comparação estrutural das operações implementadas passaram dentro da suite contract.

Smoke com subprocesso Uvicorn e HTTP real: /health 200 e APIs sem autenticação 401. Scripts Alembic upgrade e downgrade compilados offline, sem executar SQL; revision head 005. Pip check passou. Os sete planejamentos passaram em OpenSpec --strict. Avisos: Starlette/AnyIO BlockingPortal e Alembic path_separator, sem falhas. Teste de backup/restauração não executado; protocolo em REPRODUCAO.md. Meta de p95 não medida.

Pendências na execução original: aplicar migrations e executar testes HTTP/seed/constraints/concorrência em PostgreSQL 16 exclusivo; validar fluxo integrado com FRONT/equipe. A pendência dos 12 testes SQL foi posteriormente resolvida pela execução manual registrada ao final; a integração com a equipe permanece pendente. Aviso Starlette/AnyIO BlockingPortal não bloqueante. Não houve push/merge.

## Tentativa posterior de verificação PostgreSQL

Conforme solicitação de finalizar as verificações SQL, foi relido REPRODUCAO.md
e conferida apenas a presença de TEST_DATABASE_URL, sem revelar valores.
A variável não está definida no processo, no escopo User ou no escopo Machine.
Também não foram encontrados .env.test, .env.testing ou .env na raiz/backend.
Não houve fallback para DATABASE_URL ou conexão a outro banco.

Com Python 3.12.10 da .venv, a partir de backend/:

`python -m pytest tests/integration -q -rs`

Resultado real desta tentativa: **0 passed, 0 failed, 12 skipped**, todos por
TEST_DATABASE_URL ausente; um aviso Starlette/AnyIO, sem falha.
Os resultados anteriores de 58 testes aprovados pertencem à execução anterior
da suite completa e não foram reexecutados nesta tentativa.

Nenhuma migration foi aplicada e nenhuma conexão SQL foi aberta. Login,
autorização, métricas, recomendações, experimentos, relatórios, persistência e
seed dupla em PostgreSQL permanecem sem nova comprovação. Para continuar,
é necessário disponibilizar TEST_DATABASE_URL exclusiva de teste ao runner
ou indicar sua fonte local protegida, sem enviar credenciais pela conversa.
O fixture existente valida PostgreSQL 16 e cria schema nexo_test_<UUID>
antes de aplicar upgrade head/current; não executa DROP ou reset.
G00 e demais gates permanecem pendentes; não houve commit, push ou merge.

## PostgreSQL 16 — execução manual aprovada

Resultado informado pelo usuário após execução manual dos 12 testes de integração
no PowerShell, usando o PostgreSQL 16 de teste configurado anteriormente:

```text
12 passed, 3 warnings in 20.07s
```

**12 aprovados, 0 falhas e 0 pulados nessa execução SQL.** TEST_DATABASE_URL foi
configurada temporariamente e removida após a execução, conforme informado.
Nenhuma senha ou URL de conexão foi fornecida ou registrada nesta atualização.
O agente não reexecutou SQL nesta sessão e não transforma esse resultado em
execução própria: trata-se de evidência manual fornecida pelo usuário.

A conferência dos testes existentes confirma a cobertura dessa suite:

- Versão PostgreSQL 16, SELECT 1, sessões, pool e Alembic current.
- Fixture com schema exclusivo, Alembic upgrade head/current até revision 005.
- Login, perfil, conta inativa, lojas permitidas e bloqueio de acesso cruzado.
- Seed de identidade repetida, preservação de hashes e colisão externa.
- Seed de métricas repetida (180 registros), dashboard/série e constraint financeira.
- Monitoramento DEMO, mapa com 80 células/dia, vazios e seed repetida.
- Recomendação aceita persistida em sessão de teste, repetição 409, recurso externo
  404, preservação pela seed e concorrência por duas conexões PostgreSQL.
- Ciclo recomendação aceita → experimento 201 → RUNNING → COMPLETED → resultado,
  incluindo conflitos de estado e resultado ainda indisponível em DRAFT.
- Relatório comparativo, janela anterior, ausência de dados e isolamento por loja.

Isso resolve a pendência dos 12 testes anteriormente pulados. Não comprova
backup/restauração, E2E browser, reinício de contêiner/volume ou aplicação em produção.

## Revalidação adicional sem credenciais

Executado pelo agente nesta atualização, com Python 3.12.10 da .venv, em backend/:

- `python -m pytest tests/unit tests/contract -q`: **58 passed, 3 warnings in 15.29s**;
  nenhuma falha ou skip. Inclui smoke Uvicorn real sem banco e SQL Alembic offline.
- `python -m ruff check --no-cache .`: aprovado.
- `python -m mypy`: aprovado, 42 arquivos de aplicação.
- `python -m pip check`: nenhuma dependência quebrada.
- `python -m alembic heads`: revision 005, único head.
- OpenSpec `validate <change> --strict`: sete planejamentos aprovados.
- `git diff --check`: aprovado.

Avisos da execução do agente: Starlette/AnyIO BlockingPortal e duas ocorrências
de depreciação Alembic path_separator, sem falha. Os três avisos da execução SQL
manual foram informados sem o log detalhado e não são classificados por suposição.
São **70 testes aprovados somando execuções separadas** (58 do agente + 12 manuais),
não uma única execução da suite completa pelo agente com credenciais.

## Pendências atuais do M08 e da entrega

- Gerar backup exclusivamente sintético, restaurar em destino novo autorizado e
  comparar revision, contagens, vínculos e consultas conhecidas; protocolo em
  REPRODUCAO.md. Nenhum dump ou restore foi executado por esta atualização.
- Comprovar concorrência de transições de experimentos em PostgreSQL: os 12 testes
  atuais exercitam concorrência de recomendações, não esse cenário específico.
- Smoke completo em servidor externo conectado ao banco, comando de seed completo
  repetido e persistência após reinício; os testes atuais usam HTTP em processo e
  transações de teste, além de um smoke externo de saúde/autenticação sem banco.
- FRONT/proxy/Compose/CI, E2E real, evidências de volume, revisão dos PRs e validação
  da equipe sobre main; nenhum gate pode ser concluído somente pelos testes BACK.
- Medir a meta p95 de 500 ms antes de afirmar cumprimento; conferir o checklist
  final de privacidade/DEMO e reconciliar tarefas/evidências históricas OpenSpec
  com a cobertura efetivamente comprovada, sem marcar itens pendentes.
- Para publicação: revisar e autorizar commit/push das evidências atualizadas na
  branch experimental; excluir .venv, __pycache__, ambientes, dumps e credenciais.

M01–M06 têm código experimental e suite SQL manual aprovada; M08 permanece parcial.
G00 e demais gates continuam pendentes de integração. Sem commit, push ou merge.
