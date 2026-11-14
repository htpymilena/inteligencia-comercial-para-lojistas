# 05 — Guia de integração Frontend ↔ Backend

**Fonte HTTP:** `docs/openapi.yaml` (única fonte de verdade para paths, `operationId`, schemas, status e exemplos). Este documento registra o processo de implementação/testes, sem duplicar os modelos completos.

## 1. Como as camadas conversam

```text
React View → hook de feature → API client tipado → Vite proxy /api
    → FastAPI /api/v1 → dependência auth/loja → Controller
    → Service → Repository → PostgreSQL
    ← Pydantic response ← JSON ← estado TanStack Query ← UI
```

O backend NÃO depende do frontend estar pronto para ser validado (pytest + Swagger). O frontend NÃO espera todos os endpoints para começar (fixtures/mock apenas temporariamente). Integram-se **no mesmo módulo** antes do próximo.

## 2. URLs e configuração

| Contexto | URL de navegador/cliente | Observação |
|---|---|---|
| React dev | `http://localhost:5173` | Contêiner frontend expõe Vite no host |
| FastAPI dev | `http://localhost:8000` | Contêiner backend expõe API no host |
| API chamada do browser | `/api/v1` | Vite proxy roteia `/api` para `http://backend:8000` |
| Swagger/FastAPI | `http://localhost:8000/docs` | Documentação dinâmica do runtime |
| PostgreSQL interno | `db:5432` | Host do serviço Compose, **não** `localhost` dentro do contêiner |

`VITE_API_BASE_URL=/api/v1` é variável pública de build e não armazena segredos. `DATABASE_URL`, `JWT_SECRET` e senhas demo ficam apenas no backend/ambiente. `CORS_ORIGINS` é lista explícita para acesso direto à API; proxy relativo reduz a necessidade de CORS no navegador.

## 3. Padrão HTTP

- Todas as operações de negócio usam JSON UTF-8; `Content-Type: application/json` para POST/PATCH.
- Identificação: `Authorization: Bearer <access_token>` em chamadas protegidas.
- Identificadores UUID; corpo/atributos **snake_case**, exatamente como OpenAPI.
- Datas: `YYYY-MM-DD`; instantes: RFC3339 UTC; valores monetários retornam decimal como string.
- Success: 200 GET/PATCH, 201 POST, salvo contrato explícito; responses reais devem ter schema igual ao OpenAPI.
- Erros: `{ "error": {"code": "FORBIDDEN", "message": "...", "details": null}, "request_id": "..."}`.
- 401 → sessão inválida; 403 → sem permissão; 404 → recurso não encontrado; 409 → conflito/transição; 422 → validação; 500 → falha interna sem traceback público.
- O backend adapta falhas de validação FastAPI ao `ApiError` do projeto (não vazar formato 422 padrão divergente).

## 4. Controle de sessão e escopo

1. `POST /api/v1/auth/login` devolve token e usuário.
2. React mantém token em memória e solicita `GET /api/v1/auth/me` ao carregar identidade.
3. `GET /api/v1/stores` lista lojas autorizadas.
4. Seleção cria `storeId` na rota; cada request subsequente inclui `store_id` na URL e valida acesso do servidor.
5. Ao receber 401, limpar sessão/cache e redirecionar login; ao receber 403, manter sessão e apresentar acesso negado.
6. Cache deve ter chave como `['dashboard', storeId, periodStart, periodEnd]`; troca de loja descarta telas/dados sensíveis da loja anterior.

## 5. Mocks temporários sem mascarar falta de implementação

- **Antes da API existir no módulo:** frontend pode usar fixtures JSON que sigam o OpenAPI, em `frontend/src/features/<feature>/__fixtures__/` (sem dados pessoais).
- **Com API integrada:** client chama `/api/v1`; fixture fica apenas em testes. Usar feature flag `VITE_USE_MOCKS=false` por padrão do fluxo final (se criada).
- **Nunca** condicionar silenciosamente a exibição de dados fake quando endpoint falha; mostrar erro real com retry.
- Dados sintéticos **vindos do backend** continuam sendo `DEMO`, mas não são mocks HTTP: houve integração real com API e persistência.

## 6. Processo do módulo (contrato → PRs → integração)

1. Abrir checkpoint MXX e concordar com requisitos, regra, tela e `operationId`.
2. Se necessário, abrir PR de contrato (`docs/openapi.yaml`) **antes** de implementar; freeze após revisão.
3. Agente BACK implementa migration, serviço, controller e testes contrato/integrados na branch `feat/mXX-back-...`.
4. Agente FRONT implementa view, hook, client tipado, estados/validações e testes na branch `feat/mXX-front-...`, inicialmente com fixture aderente ao contrato.
5. Merge PR backend na `main` **após testes**; frontend atualiza sua branch com a `main` (rebase controlado ou merge, conforme convenção).
6. Executar Compose e substituir fixture por API real; rodar testes E2E e smoke do módulo.
7. Merge PR frontend na `main` e verificar fluxo end-to-end em `main`.
8. Registrar checkpoint `INTEGRADO` e regressão de módulos anteriores. Não começar MXX+1 sem isso.

**Importante:** usar PR e branch por módulo. **Não** fazer merge da branch backend dentro da frontend como estratégia principal; sincronizar cada uma contra `main`. Isso simplifica a história e evita que um agente incorpore alterações incompletas do outro.

## 7. Matriz de rastreabilidade

| Integração | Módulo | RF | TELA | Regras-chave | `operationId` |
|---|---|---|---|---|---|
| INT001 | M01 | RF001 | 001 | RN001–002 | `login`, `obterPerfil` |
| INT002 | M01 | RF002/RF014 | 002 | RN003–005 | `listarLojas`, `obterLoja` |
| INT003 | M02 | RF003/RF004 | 003 | RN006–012 | `obterDashboard`, `listarMetricasDiarias` |
| INT004 | M03 | RF005 | 004 | RN013 | `listarCamerasDemo`, `obterMonitoramentoDemo` |
| INT005 | M03 | RF006 | 005 | RN014–015 | `listarZonas`, `obterMapaCalorDemo` |
| INT006 | M04 | RF007/RF008 | 006 | RN016–018/RN029 | `listarRecomendacoes`, `atualizarRecomendacao` |
| INT007 | M05 | RF009/RF010 | 007–008 | RN019–023 | `listarExperimentos`, `criarExperimento`, `obterExperimento`, `alterarStatusExperimento`, `obterResultadoExperimento` |
| INT008 | M06 | RF011 | 009 | RN006–012/RN023 | `obterRelatorioComparativo` |
| INT009 | M07 | RF012/RF013 | 010–011 | RN024–027 | `listarCircuitos`, `criarCircuito`, `obterCircuito`, `alterarStatusCircuito`, `obterEstatisticasCircuito` |
| INT000 | M00 | RF016 | — | RN028/RN030 | `verificarSaude` |

## 8. Exemplo completo de integração de uma fatia

**M04 — aceitar recomendação:** Front envia `PATCH /api/v1/stores/{store_id}/recommendations/{recommendation_id}` com `{"status":"ACCEPTED"}`. Controller valida token/loja e schema; service verifica estado `PROPOSED`; repository grava em transação; API retorna recomendação atualizada (200). UI invalida cache e renderiza status `ACCEPTED`. Uma segunda tentativa com status oposto devolve 409 `CONFLICT`, UI recarrega lista. Testes: caminho feliz + sem token + outra loja + repetição + erro de rede.

## 9. Política de mudanças de contrato

- `openapi.yaml` deve estar na `main` **antes** de o endpoint entrar em produção do módulo.
- Mudanças não quebráveis: novo campo **opcional**, novo endpoint/valor somente com cliente preparado e testes.
- Mudanças quebráveis: remoção/renomeação de campos, enum, mudança de path/status, obrigatoriedade nova; requer proposta conjunta, testes, atualização de frontend e backend no mesmo checkpoint.
- Preferir não alterar contratos de módulos anteriores; novas necessidades usam extensão negociada. Evitar dois agentes editarem simultaneamente `openapi.yaml`.
- CI valida IDs únicos, schemas, status e se a API runtime está coerente com as operações implementadas no módulo.

## 10. Definition of Done (DoD) para *qualquer* módulo

- [ ] Contrato aprovado e estável; `operationId` implementados.
- [ ] Migração executa e seed é idempotente, se módulo cria dados.
- [ ] Backend valida autorização e regras; testes sucesso/erro passam.
- [ ] Frontend usa client tipado e API **real**; não mantém mock ativo no fluxo.
- [ ] Layout/navegação de telas correspondem ao wireframe e ao mapeamento.
- [ ] Há estados loading, vazio, erro e permissão negada.
- [ ] Teste E2E da ação principal passou via Docker Compose.
- [ ] Indicadores demo estão explicitamente rotulados.
- [ ] Regressão dos módulos anteriores passa.
- [ ] PRs revisados, `main` verde e checkpoint atualizado.

## 11. Problemas comuns e resolução

| Sintoma | Diagnóstico provável | Ação |
|---|---|---|
| React chama `http://backend:8000` no browser | Host Docker é interno | Usar `/api/v1` + proxy Vite |
| CORS bloqueia chamada direta | Origem não liberada | Rever `CORS_ORIGINS`, preferir proxy |
| 401 após reload | JWT guardado em memória | Novo login (comportamento documentado) |
| Front espera `camelCase`, API devolve `snake_case` | Contrato desrespeitado | Corrigir client/types pelo OpenAPI |
| Gráfico muda ao selecionar outra loja | Cache sem `storeId` | Incluir loja e período na query key |
| DB não pronto na inicialização | `depends_on` sem healthcheck | Definir `service_healthy` e retry ORM |
| Seed duplica dados | Falta chave única/UPSERT | Reforçar constraints e idempotência |
| Tela parece transmissão real | Ausência de rotulagem | Exibir DEMO e placeholder, retirar `AO VIVO` |

## 12. Registro de pendências por checkpoint

Abrir a PR com `Pendências: [ ] nenhuma / [ ] ...`. Atualizar tabela de status em `10-AGENTES-GIT-E-CHECKPOINTS.md` após cada merge. Bugs impeditivos bloqueiam módulos seguintes; aprimoramentos não essenciais entram no backlog.
