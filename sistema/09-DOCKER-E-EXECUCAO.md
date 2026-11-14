# 09 — Docker Compose e execução local

Este documento define a configuração **a implementar no M00**. O pacote entregue contém documentação, não imagens Docker, aplicação construída nem um Compose já validado.

## 1. Serviços obrigatórios

| Serviço | Papel | Host de desenvolvimento | Porta interna |
|---|---|---|---|
| `db` | PostgreSQL 16 com volume persistente | não expor por padrão | 5432 |
| `backend` | FastAPI + migrations + seeds manuais | `localhost:8000` | 8000 |
| `frontend` | Vite + React com proxy `/api` | `localhost:5173` | 5173 |

O browser acessa `localhost:5173`; o Vite resolve `http://backend:8000` **dentro do Docker**. Dentro de contêiner, `localhost` aponta para si próprio, não para outro serviço.

## 2. `compose.yaml` de referência para o M00

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-nexo}
      POSTGRES_USER: ${POSTGRES_USER:-nexo}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Defina POSTGRES_PASSWORD no .env}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 3s
      retries: 15
    networks: [nexo_net]

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+psycopg://${POSTGRES_USER:-nexo}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-nexo}
      JWT_SECRET: ${JWT_SECRET:?Defina JWT_SECRET no .env}
      CORS_ORIGINS: http://localhost:5173
      DEMO_ADMIN_PASSWORD: ${DEMO_ADMIN_PASSWORD:?Defina senha demo no .env}
      DEMO_LOJISTA_PASSWORD: ${DEMO_LOJISTA_PASSWORD:?Defina senha demo no .env}
      DEMO_BASE_DATE: ${DEMO_BASE_DATE:-}
    ports:
      - "127.0.0.1:8000:8000"
    depends_on:
      db:
        condition: service_healthy
    networks: [nexo_net]

  frontend:
    build: ./frontend
    environment:
      VITE_API_BASE_URL: /api/v1
      VITE_PROXY_TARGET: http://backend:8000
    ports:
      - "127.0.0.1:5173:5173"
    depends_on:
      - backend
    networks: [nexo_net]

volumes:
  postgres_data:

networks:
  nexo_net:
```

**Nota:** é um modelo para implementar, não basta copiar para que suba sem `backend/Dockerfile`, `frontend/Dockerfile`, dependências e código M00. Recomenda-se leitura das variáveis de conexão no backend e bind do Uvicorn em `0.0.0.0`.

## 3. `.env.example` proposto (sem segredos reais)

```dotenv
POSTGRES_DB=nexo
POSTGRES_USER=nexo
POSTGRES_PASSWORD=SUBSTITUIR_POR_SENHA_LOCAL
JWT_SECRET=SUBSTITUIR_POR_CHAVE_LONGA_ALEATORIA
DEMO_ADMIN_PASSWORD=SUBSTITUIR_SENHA_DEMO
DEMO_LOJISTA_PASSWORD=SUBSTITUIR_SENHA_DEMO
DEMO_BASE_DATE=
```

Criar `.env` local copiando o exemplo e configurar valores; `.env` deve estar em `.gitignore`. Evitar imprimir credenciais em logs e **nunca** deixar passwords de demonstração em deployment público.

## 4. Requisitos dos Dockerfiles

**Backend:** base Python 3.12 slim, instalar dependências com lock, usuário sem privilégios quando viável, expor 8000, comando `uvicorn app.main:app --host 0.0.0.0 --port 8000`. Migrações não devem depender de execução oculta na importação de módulos.

**Frontend:** Node 22 Alpine para dev, instalar `npm ci` com lock, Vite `--host 0.0.0.0`, `vite.config.ts` com proxy `'/api': { target: process.env.VITE_PROXY_TARGET || 'http://backend:8000', changeOrigin: true }`. Em produção, compilar estáticos e servir via proxy web; Vite dev não é servidor de produção.

## 5. Comandos do fluxo diário (após M00 implementado)

```bash
cp .env.example .env                # primeira execução; editar valores

docker compose up --build -d

docker compose ps
docker compose logs -f backend

docker compose exec backend alembic upgrade head

docker compose exec backend python -m app.seed_demo

curl http://localhost:8000/health
# Browser: http://localhost:5173
```

**Recomendação:** script `make dev` opcional, mas comandos acima devem funcionar diretamente; seed demo só quando explicitamente invocada.

## 6. Como testar cada módulo

- **Backend:** `docker compose exec backend pytest` (se dependências de teste estiverem instaladas na imagem dev).
- **Frontend:** `docker compose exec frontend npm test -- --run` (definir script `test` no M00).
- **Tipagem:** `docker compose exec frontend npm run typecheck`.
- **E2E:** definir `npm run e2e` com Playwright e configurar acesso ao browser no host ou contêiner de testes separado.
- **Banco:** inspecionar com `docker compose exec db psql -U nexo -d nexo` (ajustar nomes por env).
- **Contrato:** comparar `docs/openapi.yaml` com `http://localhost:8000/openapi.json`; o runtime pode conter endpoints de módulos ainda não iniciados apenas se implementados.

## 7. Recuperação e cuidados

| Operação | Comando | Risco |
|---|---|---|
| Parar serviços | `docker compose stop` | preserva containers/dados |
| Remover containers | `docker compose down` | preserva volume do banco |
| Reiniciar um serviço | `docker compose restart backend` | não recompila imagem |
| Atualizar imagens | `docker compose up --build -d` | pode alterar runtime, dados preservados |
| **Apagar volume** | `docker compose down -v` | **PERDA DE DADOS**; só em ambiente demo descartável |

Não executar `down -v`, `DROP DATABASE` ou limpeza ampla automaticamente via agente sem autorização explícita. Separar credenciais e volumes por ambiente.

## 8. Limites de produção

O Compose descrito é voltado à demonstração acadêmica e desenvolvimento. Publicação real exige HTTPS, secrets manager, proxy, monitoramento, backup/restore, revisão LGPD, controle de sessão reforçado, tratamento de dados reais e políticas de retenção. Não usar a implementação demo como sistema de vigilância.
