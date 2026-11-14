# Backend M00 — NEXO 2031

## M08 experimental

Ver REPRODUCAO.md para execução, smoke e protocolo de backup sintético.
Regressão verifica autorização antes de SQL, papel persistido após emissão de JWT,
validação de segredos, requests reais em Uvicorn e compilação offline das migrations.
Migrations, seeds, concorrência, backup/restauração e E2E reais ainda exigem banco
de teste e a equipe; nenhuma aprovação de gate é inferida. Não houve captura de mídia,
mudança de contrato, FRONT, Compose ou CI. M07 não está implementado.

## M06 experimental

GET `/api/v1/stores/{store_id}/reports/summary?period_start=...&period_end=...`
reutiliza métricas e comparador M02/M05. Até 366 dias inclusivos; baseline é a
janela imediatamente anterior de mesmo tamanho. Dias ausentes tornam available=false
com motivo e baseline/current/changes null. Zero registrado mantém available=true,
com percentuais null quando divisor zero. Conversão compara pontos percentuais.
Não há nova tabela, seed ou endpoint de CSV. Ver EVIDENCIAS-M06.md.

## M05 experimental

Rotas `/api/v1/stores/{store_id}/experiments`: GET lista, POST cria (201),
GET `/{experiment_id}`, PATCH `/{experiment_id}/status`, GET `/{experiment_id}/result`.
Criação exige recomendação ACCEPTED da mesma loja e título de 3..140 caracteres.
DRAFT→RUNNING/CANCELLED e RUNNING→COMPLETED/CANCELLED; terminais não reabrem (409).
Resultado exige COMPLETED e todos os dias das duas janelas de N dias; caso contrário,
available=false, motivo e baseline/during/changes null. Disclaimer observacional sempre.
Revision 005; sem restrição de unicidade de experimento por recomendação e sem seed
de experimento opcional: o ciclo é criado pela API ou fixtures de teste.

## M04 experimental

GET `/api/v1/stores/{store_id}/recommendations` aceita filtro opcional `status`.
PATCH `/{recommendation_id}` aceita somente ACCEPTED ou DISMISSED a partir de
PROPOSED. Repetição terminal e corrida retornam 409; ID externo retorna 404.
Estado e versão são comparados atomicamente, com version interno e timestamps UTC.
Seed inclui três sugestões por loja, com hipótese/evidência fictícias e
RULE_BASED_DEMO, sem LLM ou modelo treinado; reexecução preserva decisões.
Revision 004; testes PostgreSQL/concorrência preparados e ainda pendentes.

## M03 experimental

GETs por loja: `/cameras`, `/monitoring/demo`, `/zones` e `/heatmap/demo?date=YYYY-MM-DD`.
JWT e autorização M01 são obrigatórios. Não há captura ou URL de vídeo real.
Snapshot ausente retorna 404; mapa sem data persistida retorna cells/insights vazios.
Seed explícita inclui uma câmera/snapshot por loja, zonas e 7 dias de grade 10×8.
Valores são DEMO e constraints impedem contagens negativas, zonas fora da grade
ou intensidades fora de 0..1. Revision 003. Ver EVIDENCIAS-M03.md para SQL pendente.

## M02 experimental

GET `/api/v1/stores/{store_id}/dashboard` e `/metrics/daily` exigem JWT e
`period_start`/`period_end` inclusivos, até 366 dias. Seed explícita acrescenta
60 dias por loja terminando em `DEMO_BASE_DATE` (padrão dia local Araguaína).
Receitas são Decimal exatas em centavos, não negativas, com serialização string.
Negativos, não finitos e precisão inválida falham antes da escrita. Interações
podem superar visitantes. Taxa usa totais; divisor zero retorna null.
Datas sem métricas não são preenchidas. Revision Alembic 002; sem ingestão HTTP.
SQL ainda depende de TEST_DATABASE_URL nesta sessão; ver EVIDENCIAS-M02.md.

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
