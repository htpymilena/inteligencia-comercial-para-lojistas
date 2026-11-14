# Backend M00 — NEXO 2031

## Branch experimental M01

Esta branch inclui identidade e lojas conforme contrato, além do M00 preservado.
Exige `JWT_SECRET` via ambiente, com pelo menos 32 bytes, sem valor padrão.
Não há refresh ou cadastro público. Aplicar `python -m alembic upgrade head`
somente no banco autorizado antes de executar `python -m app.seed_demo`.
A seed exige `DEMO_ADMIN_PASSWORD` e `DEMO_LOJISTA_PASSWORD` via ambiente;
emails são admin@demo.invalid e lojista@demo.invalid. Reexecução não redefine
senhas e falha em colisões. Não há seed no startup. Segredos não vão em logs.

Rotas M01: POST /api/v1/auth/login, GET /api/v1/auth/me, GET /api/v1/stores,
GET /api/v1/stores/{store_id}. JWT Bearer obrigatório exceto login e /health.
ADMIN acessa todas; LOJISTA somente vínculos persistidos (403 nas demais).
Validação retorna 422 ApiError; identidade inválida/inativa retorna 401.
O engine é criado sem conectar no startup, sessão fecha por request e engine
é descartado no shutdown. Ver EVIDENCIAS-M01.md para os limites SQL atuais.

As seções M00 abaixo registram a baseline; no estado experimental, o runtime
anuncia também operações M01 implementadas e requer JWT_SECRET no startup.

Somente `GET /health` está implementado: público, `verificarSaude`,
`{"status":"ok","service":"nexo-api"}`. Mede disponibilidade HTTP.
O contrato normativo permanece em [sistema/openapi.yaml](../sistema/openapi.yaml).
Os caminhos `docs/` da baseline correspondem aos arquivos existentes em `sistema/`.

## Ambiente e dependências

Python 3.12 (verificado com 3.12.10). Use a `.venv` da raiz, protegida por
`/.venv/` no GitIgnore. Comandos PowerShell a partir de `backend/`:

```powershell
..\.venv\Scripts\python.exe --version
..\.venv\Scripts\python.exe -m pip install -r requirements.lock
..\.venv\Scripts\python.exe -m pip check
```

`pyproject.toml` fixa dependências diretas de runtime e desenvolvimento;
`requirements.lock` fixa a resolução transitiva completa, obtida na `.venv`
Python 3.12 Windows. O driver binário psycopg é instalado explicitamente.
Revisar e regenerar o lock deliberadamente ao atualizar dependências.
Nenhuma instalação de Python, PostgreSQL ou outra ferramenta faz parte destes comandos.

## Configuração e execução

Única variável obrigatória do M00: `DATABASE_URL`, URL válida com esquema
`postgresql+psycopg`. Injete o valor pelo ambiente; nenhum `.env` é carregado.
Não grave credenciais no repositório ou em logs. JWT e senhas demo pertencem ao M01.
Para verificar apenas HTTP sem banco ativo, pode-se usar a URL sintética abaixo
(porta 1 propositalmente indisponível, sem credenciais reais):

```powershell
$env:DATABASE_URL = 'postgresql+psycopg://test:test@127.0.0.1:1/nexo_test'
$env:PYTHONDONTWRITEBYTECODE = '1'
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --no-access-log
# Em outro terminal:
curl.exe http://localhost:8000/health
```

Pare o servidor com Ctrl+C. A configuração é validada no startup com diagnóstico
sem valores secretos. Importação e saúde não abrem conexão SQL. Use `--no-access-log`
para evitar que o log padrão do Uvicorn registre query strings; a aplicação escreve
JSON em stdout com request ID gerado, método, rota registrada, status e duração em ms.
Erros internos retornam `ApiError` 500 sem detalhes da exceção. O request ID também
é devolvido em `X-Request-ID`. Não há autenticação, seed, tabelas ou `create_all` no M00.

## Verificações independentes

```powershell
..\.venv\Scripts\python.exe -m pytest tests/unit tests/contract
..\.venv\Scripts\python.exe -m ruff check --no-cache .
..\.venv\Scripts\python.exe -m mypy
..\.venv\Scripts\python.exe -m alembic heads
```

Testes unitários e contratuais usam pytest/httpx em processo e ambiente controlado,
sem FRONT, Compose, CI ou banco ativo. Comparam schemas, respostas reais 200/500,
operationId, security pública e escopo runtime somente M00 com o contrato original.
`alembic heads` deve terminar sem heads: ainda não há migrações de negócio.

## Integração SQL separada

Exige PostgreSQL **16** acessível e uma base exclusiva de testes fornecida pela
equipe. Injete sua URL em `TEST_DATABASE_URL` por ambiente, sem versionar o valor.

```powershell
..\.venv\Scripts\python.exe -m pytest tests/integration
..\.venv\Scripts\python.exe -m alembic -x test=true current
```

O runner não usa `DATABASE_URL` como fallback nem SQLite. Verifica versão do
servidor, `SELECT 1`, ciclo de sessão/conexão e Alembic current sem criar tabelas.
Sem `TEST_DATABASE_URL`, o teste é explicitamente pulado e a tarefa 3.7 fica pendente.
Uma URL fornecida mas inválida/inacessível causa falha saneada.
`alembic current` sem `-x test=true` usa a configuração normal da aplicação;
para evidência SQL de teste, use sempre o comando acima.

G00 permanece PENDENTE: proxy, FRONT, Compose, persistência e integração pela equipe
não são comprovados pelos testes HTTP. Consulte [EVIDENCIAS.md](EVIDENCIAS.md).
