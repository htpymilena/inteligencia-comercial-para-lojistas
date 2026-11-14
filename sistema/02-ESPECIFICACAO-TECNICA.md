# 02 — Especificação técnica e arquitetura

**Versão:** 1.0.0. Decisões aqui são o padrão de implementação sugerido, não fatos já executados.

## 1. Stack e limites

| Parte | Tecnologia de referência | Responsabilidade |
|---|---|---|
| Frontend | React + TypeScript + Vite + React Router | Views, navegação e UX |
| Estado servidor | TanStack Query | Cache e invalidação por `storeId` e filtro |
| HTTP | `fetch` tipado ou Axios padronizado (escolher um no M00) | Cliente único consumindo OpenAPI |
| Charts | Recharts (ou solução acessível equivalente) | Visuais acompanhados de resumo em texto |
| Backend | Python 3.12 + FastAPI + Pydantic v2 | Controllers HTTP, DTOs, validações |
| Negócio | Serviços Python | Regras, cálculos e transições |
| Dados | SQLAlchemy 2.x + Alembic | Repositórios, ORM e migrations |
| Persistência | PostgreSQL 16 | Dados agregados e demonstração |
| Ambientes | Docker Compose + Dockerfiles frontend/backend | Executar os 3 serviços juntos |
| Testes | pytest + httpx; Vitest + RTL; Playwright | Unitários, integração e E2E |

**Versões fixas:** pinagem exata será criada nos manifests do M00, com atualização intencional por PR. Não depender de `latest` em imagens Docker.

## 2. MVC adaptado corretamente à Web + API

```text
Browser
  └─ React (View: páginas/componentes)
      └─ hooks/controller de interação + client HTTP (controle da UI)
          └─ HTTP JSON /api/v1
              └─ FastAPI router (Controller)
                  └─ Service (domínio, autorização e regras)
                      └─ Repository SQLAlchemy (Model + persistência)
                          └─ PostgreSQL
```

**Esclarecimento:** não há um único MVC atravessando navegador e servidor. O backend usa separação `controller/service/repository/model`; no frontend, as páginas são *views*, hooks controlam estados e serviços HTTP acessam dados. Não duplicar regras no frontend: validação de UI não substitui autorização servidor.

## 3. Estrutura planejada do monorepositório

```text
nexo-2031/
├── AGENTS.md
├── README.md
├── compose.yaml                    # criado no M00
├── .env.example                   # criado no M00, sem credenciais reais
├── docs/
│   ├── 01-PRD.md ... 11-PRIVACIDADE-E-DEMO.md
│   └── openapi.yaml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── app/{router,providers}/
│   │   ├── components/{layout,ui,charts}/
│   │   ├── features/
│   │   │   ├── auth/ stores/ dashboard/ monitoring/
│   │   │   ├── heatmap/ recommendations/ experiments/
│   │   │   └── reports/ circuits/
│   │   ├── lib/{api,auth,errors}/
│   │   ├── styles/
│   │   └── main.tsx
│   └── tests/
└── backend/
    ├── Dockerfile
    ├── pyproject.toml
    ├── alembic/
    ├── app/
    │   ├── main.py
    │   ├── core/{config,security,errors,logging}.py
    │   ├── db/{base,session}.py
    │   ├── models/
    │   ├── schemas/
    │   ├── repositories/
    │   ├── services/
    │   ├── api/v1/routers/
    │   └── seed_demo.py
    └── tests/{unit,integration,contract}/
```

Módulos dividem *features* e responsabilidades, não exigem microserviços. Um único FastAPI e um único PostgreSQL são suficientes.

## 4. Padrões de desenvolvimento

- Código: `snake_case` no Python, `camelCase` em funções TypeScript e `PascalCase` em componentes React.
- HTTP JSON: `snake_case` em campos/rotas com substantivos plurais, segundo OpenAPI. O frontend **não** renomeia silenciosamente propriedades.
- Operações: use exatamente `operationId` de `openapi.yaml`, com `APIClient`/funções geradas ou tipadas pelo contrato.
- Backend: controllers não acessam diretamente ORM; serviços não recebem `Request`/`Response` como regra; repositórios não definem política de acesso.
- Chaves: UUIDs string; datas `YYYY-MM-DD`; instantes RFC3339 UTC com timezone; valores monetários `string` decimal (`"1250.00"`), nunca float para cálculo de receita.
- Listagens simples do MVP são arrays e têm limites fixos por cenário demo; antes de escalar, introduzir paginação versionada no OpenAPI.
- Respostas de sucesso seguem schemas explícitos; erros seguem `ApiError` (não devolver HTML).
- Páginas têm loading, empty, error, forbidden; componentes gráficos incluem descrição textual.

## 5. Multi-loja e autorização

- `users` possuem `role` (`ADMIN`/`LOJISTA`). Vínculo `user_stores` determina lojas permitidas.
- `ADMIN` tem acesso a qualquer loja/circuito. `LOJISTA` somente a lojas vinculadas.
- Toda rota com `{store_id}` valida autorização **antes** de consultar dados da loja; nunca confiar no ID passado pelo browser.
- Circuito com três lojas: admin cria/altera; lojista visualiza apenas circuito que contenha ao menos uma loja vinculada.
- JWT de acesso com `sub`, `role`, `exp`; expiração proposta 30 min; sem refresh token no MVP. Hash de senha com Argon2 ou bcrypt (pin no M00). Nunca gravar senhas simples.
- Token em **memória da aplicação** durante sessão; ao atualizar página, solicitar login novamente (compromisso deliberado MVP). Não usar localStorage para tokens.

## 6. Modelo de dados e tempo

Consultar `07-MODELO-DADOS.md`. Todas as métricas do MVP são agregadas por loja e dia, ou snapshots demonstrativos. `demo_source`/`data_origin` deve ser `DEMO` e persistir onde aplicável.

- Aplicação armazena instantes UTC; período diário exibido na loja no fuso de negócios configurado (padrão `America/Araguaina`).
- `period_start`/`period_end` são **inclusivos** nas consultas de métricas; limites documentados no OpenAPI.
- Migrações Alembic são obrigatórias; `create_all` não é estratégia de produção.
- Seeds idempotentes criam 3 lojas, 1 admin, 1 lojista e 60 dias de métricas demonstrativas; datas relativas a uma data-base configurada para testes determinísticos.

## 7. Segurança e privacidade

- Secrets via variáveis de ambiente: `DATABASE_URL`, `JWT_SECRET`, `DEMO_ADMIN_PASSWORD`, `DEMO_LOJISTA_PASSWORD`. Nunca versionar valores.
- Configurar `CORS_ORIGINS` explicitamente; preferir proxy Vite `/api` para `backend:8000` no Compose.
- Não registrar JWTs, senhas, corpos com segredos nem imagem de pessoas em logs.
- Registrar request ID, método, rota, status e tempo. Mensagens de erro não expõem SQL ou stack trace ao browser.
- Sem câmera real, armazenamento de foto/áudio ou processamento biométrico no MVP.

## 8. Observabilidade e saúde

- `GET /health` retorna disponibilidade HTTP da API; saúde do PostgreSQL é garantida no Compose por healthcheck e verificada por teste de integração.
- Logger estruturado em stdout; Compose agrega logs. Datas/IDs em logs para correlação.
- O frontend inclui notificação de erro compreensível e botão de tentar novamente.

## 9. Deploy, configuração e CI

- Desenvolvimento: três serviços `frontend`, `backend`, `db` via Compose, sem serviços externos obrigatórios.
- Portas host propostas: `5173` React, `8000` API, `5432` PostgreSQL apenas se necessário ao desenvolvedor (não publicar DB em produção).
- Em produção: HTTPS + proxy reverso + segredos fortes + backups + limite de acesso; Compose dev não equivale a prontidão para produção.
- CI por PR: lint, typecheck, testes backend, frontend, validação OpenAPI e smoke test Compose (quando infra de CI suportar).
- PRs e branch/merge: `10-AGENTES-GIT-E-CHECKPOINTS.md`; Docker: `09-DOCKER-E-EXECUCAO.md`.

## 10. Decisões registradas (ADRs curtas)

| ADR | Decisão | Alternativa descartada e motivo |
|---|---|---|
| ADR-001 | Monorepo | Repositórios distintos criariam sincronização excessiva de contrato |
| ADR-002 | Módulos verticais com gates | Front inteiro + back inteiro causaria integração tardia |
| ADR-003 | FastAPI separando controller/service/repository | Regras dentro do router dificultam testes |
| ADR-004 | OpenAPI como contrato oficial | Modelos duplicados manualmente divergem |
| ADR-005 | Dados DEMO por seed | Câmeras reais são caros, complexos e sensíveis |
| ADR-006 | Regras explicáveis como recomendação MVP | Chamar regras de modelo treinado seria enganoso |
| ADR-007 | JWT em memória sem refresh | Reduz complexidade inicial; recarregamento faz relogin |
| ADR-008 | Um PostgreSQL + Alembic | Serviços/bancos separados desnecessários nesta escala |
