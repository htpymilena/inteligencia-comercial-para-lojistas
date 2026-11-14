# Evidências BACK — M00

Execução local em 14/11/2026. Escopo: tarefas 3.1–3.8 da mudança
`m00-ambiente-e-contrato`; nenhuma aprovação G00 ou integração completa.

## Ambiente confirmado

- `.venv/Scripts/python.exe --version`: Python **3.12.10**.
- OpenSpec pelo caminho absoluto fornecido: **2.0.0**, mudança pronta (`spec-driven`).
- `.gitignore` raiz criado com somente `/.venv/`, conforme autorização explícita.
- `git check-ignore -v .venv/Scripts/python.exe`: regra `.gitignore:1:/.venv/`.
- Dependências instaladas exclusivamente na `.venv`; acesso à rede autorizado
  após bloqueio inicial do sandbox. Resolução registrada em `requirements.lock`.

## Resultados executados

Comandos Python abaixo executados em `backend/` pelo interpretador
`..\.venv\Scripts\python.exe`, com `PYTHONDONTWRITEBYTECODE=1`.

| Comando | Resultado |
|---|---|
| `python -m pytest tests/unit tests/contract -q` | 11 passaram |
| `python -m pytest tests/integration -q` | 1 pulado: `TEST_DATABASE_URL` ausente |
| `python -m ruff check --no-cache .` | Passou |
| `python -m mypy` | Passou, 9 arquivos de aplicação |
| `python -m alembic heads` | Exit 0, sem heads (nenhuma migração) |
| `python -m pip check` | Nenhuma dependência quebrada |

O pytest emitiu um aviso de depreciação de `BlockingPortal` entre Starlette e AnyIO;
não houve falha. Ajustes de formatação e configuração do plugin Pydantic/mypy
foram feitos antes dos checks finais.

Cobertura verificada: startup válido, configuração ausente/inválida com diagnóstico
saneado, importação/HTTP sem conexão SQL, saúde pública com corpo exato,
falha controlada 500, correlação de request ID e ausência de credenciais,
query strings, SQL ou stack trace nos logs da aplicação e na resposta.
Os testes contratuais leem o YAML original e comparam schemas, respostas reais,
operationId, security e caminhos, sem anunciar operações futuras.

## Smoke HTTP real

Uvicorn iniciado em loopback, usando URL SQL sintética na porta 1 (sem banco ativo):

```text
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --no-access-log
curl.exe http://localhost:8000/health
{"status":"ok","service":"nexo-api"}
```

Startup concluído e log JSON com `GET`, `/health`, status 200, request ID e duração.
O processo iniciado para o smoke foi encerrado ao final. Isso comprova somente HTTP.

## Integração PostgreSQL — tarefa 3.7 concluída

Evidência de execução manual fornecida pelo usuário e registrada em 14/11/2026.
Executado no PowerShell, dentro de `backend/`, com Python **3.12.10** do
ambiente virtual:

```text
python -m pytest tests/integration/test_database.py -v
tests/integration/test_database.py::test_postgresql16_session_and_alembic PASSED
1 passed in 3.86s
```

A conferência do código de `tests/integration/test_database.py`,
`app/db/session.py` e `alembic/env.py` confirmou que esse teste cobre:

- PostgreSQL 16 real, validado por `SHOW server_version_num` no intervalo
  de 160000 (inclusive) a 170000 (exclusive).
- `SELECT 1` por conexão direta e por duas sessões sucessivas.
- Ciclo de sessões e devolução de conexões ao pool (`checkedout() == 0`),
  com descarte do engine ao final.
- `python -m alembic -x test=true current`, com código de saída zero.
- Uso exclusivo de `TEST_DATABASE_URL`, inclusive no subprocesso Alembic,
  sem fallback para `DATABASE_URL` ou SQLite.

O arquivo executado é o único teste em `tests/integration/`, cobrindo assim
a integração SQL prevista na tarefa. O resultado manual aprovado substitui
a pendência da execução anterior pulada, preservada na tabela como histórico.
Nesta atualização documental, o agente não reexecutou os testes nem consultou
o ambiente de conexão. Nenhuma URL ou credencial foi registrada e nenhuma
operação no banco foi executada pelo agente.

## Pendências e limites

- **3.7 concluída:** integração SQL validada pela execução manual acima,
  após conferência da cobertura do teste. Tarefas BACK 3.1–3.8 concluídas.
- BACK M00 com verificações locais registradas; G00 **PENDENTE**, sem declarar
  M00 integrado ou liberar avanço a M01.
- FRONT, proxy, Compose, Dockerfiles, CI, persistência e revisão/integração pela equipe
  continuam fora desta entrega. Nenhum commit ou push foi executado.
- Não houve alteração no contrato ou no planejamento técnico; somente atualização
  dos checkboxes das tarefas efetivamente concluídas.
