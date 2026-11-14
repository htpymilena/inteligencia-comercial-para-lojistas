# Reprodução do BACK experimental

M01–M06 estão implementados nesta branch de desenvolvimento independente.
Nenhum gate está integrado. TEST_DATABASE_URL ausente significa testes SQL pulados,
não aprovação de persistência ou migrations. Não usar SQLite como evidência.

## Preparação autorizada

Use Python 3.12 da .venv, instale requirements.lock e execute pip check.
Forneça DATABASE_URL (postgresql+psycopg), JWT_SECRET com ao menos 32 bytes,
DEMO_ADMIN_PASSWORD, DEMO_LOJISTA_PASSWORD e DEMO_BASE_DATE pelo ambiente protegido.
Não copie valores para documentos, histórico de comandos, screenshots ou Git.
Não há carregamento automático de .env ou seed no startup.

Em backend/, usando o interpretador da .venv:

```text
python -m alembic upgrade head
python -m app.seed_demo
python -m app.seed_demo
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --no-access-log
```

Executar migrations/seed somente em banco autorizado. Para testes, injetar URL
exclusiva em TEST_DATABASE_URL. O fixture cria schema nexo_test_<UUID>, aplica
upgrade head/current, usa rollback por teste e preserva schema no término.
Registrar o nome não secreto impresso para inspeção/limpeza autorizada posterior.
Sem permissão de criação de schema, registrar bloqueio; nunca usar base dev como fallback.

```text
python -m pytest tests/unit tests/contract tests/integration -q
python -m ruff check --no-cache .
python -m mypy
python -m pip check
python -m alembic heads
```

## Smoke real ainda requerido

Saúde → login com email demo e senha do ambiente → perfil → lojas autorizadas →
dashboard/série → câmeras/zonas/mapa DEMO → aceitar recomendação → criar experimento →
iniciar → concluir → resultado → relatório. Usar período dentro da data-base
semeada, com baseline coberta. Verificar também senha inválida 401, loja externa
403, recurso externo 404, conflito terminal 409 e validação 422 ApiError.
Não imprimir tokens, senhas ou URL SQL; extraí-los e mantê-los apenas em memória.

## Backup/restauração de teste — pendente de execução

Exige pg_dump/pg_restore compatíveis com PostgreSQL 16, origem exclusivamente
sintética autorizada e destino novo exclusivo. Não apontar a dados pessoais.
Fornecer conexão por configuração local protegida (serviço PostgreSQL/arquivo
de senha restrito), sem URL com senha em argumentos ou logs.

1. Gerar dump custom da base/schema de teste autorizado; guardar fora do Git,
   em diretório local protegido, sem versionar hashes de senha ou identidades.
2. Restaurar em destino novo criado para essa validação, sem --clean, DROP,
   reset, sobrescrita ou remoção de volume.
3. Conferir revision Alembic, contagens, vínculos e consultas de resultado conhecido;
   registrar somente resultados saneados e identificadores técnicos não secretos.
4. Preservar origem/destino e solicitar limpeza separadamente se necessária.

Nenhum backup/restauração foi executado nesta sessão: conexão exclusiva ausente.
Scripts Alembic upgrade/downgrade podem ser compilados offline sem executar SQL;
isso não prova aplicação ou rollback real. Não foi medida a meta p95 de 500ms.
FRONT, Compose, CI e E2E browser continuam sob responsabilidade da equipe.
