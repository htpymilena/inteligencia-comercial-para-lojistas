# 06 — Mapa de módulos: entregas integradas para 2 agentes

**Documento operacional principal.** Não implementar primeiro todo o backend e só depois todo o frontend. Cada módulo é uma **fatia vertical** com banco/API/tela, testes e merge. O backend pode entrar em `main` antes do frontend **dentro do mesmo módulo**; a etapa só termina com ambos integrados.

## 1. Fluxo repetido em cada módulo

```text
ACORDAR ESCOPO + CONGELAR OPENAPI
             ↓
         ┌──────────────┬───────────────┐
         │ AGENTE BACK  │  AGENTE FRONT │
         │ DB + API     │  view + hooks │
         │ + pytest     │  + fixtures   │
         └──────────────┴───────────────┘
             ↓                  ↓
           PR back → main → atualizar branch front
                               ↓
                   Conectar com API real no Compose
                               ↓
                 E2E + regressão + PR front → main
                               ↓
                CHECKPOINT INTEGRADO: pode avançar
```

## 2. Dependências e cronograma lógico

| Ordem | Módulo | Entrega demonstrável | Dependência | Portão |
|---|---|---|---|---|
| 0 | **M00 Infra** | Compose + `/health`, front shell | — | `G00` |
| 1 | **M01 Identidade e lojas** | Login → escolher loja | M00 | `G01` |
| 2 | **M02 Painel e métricas** | Dashboard com banco demo | M01 | `G02` |
| 3 | **M03 Monitoramento e mapa** | Câmeras fictícias + mapa de calor | M02 | `G03` |
| 4 | **M04 Recomendações** | IA baseada em regras + aceite/rejeição | M02 | `G04` |
| 5 | **M05 Experimentos** | Criar, iniciar, concluir, comparar | M04 | `G05` |
| 6 | **M06 Relatórios** | Antes/depois agregado | M02, M05 | `G06` |
| 7 | **M07 Circuitos de 3 lojas** | Campanha cooperativa demonstrativa | M01, M02 | `G07` (opcional) |
| 8 | **M08 Finalização** | Regressão, UX, privacidade, apresentação | M00–M06 | `G08` |

**Se o prazo apertar:** manter M00–M06 completos; M07 pode aparecer como protótipo não funcional **claramente sinalizado**, sem fingir integração. Não sacrificar integridade dos módulos já concluídos para adicionar telas.

## 3. M00 — Ambiente e contrato

**Objetivo:** os dois agentes executam um monorepo com mesma configuração.

**BACK:** estruturar FastAPI, `/health`, configuração por env, logs, dependências, SQLAlchemy/Alembic vazios, testes smoke. **FRONT:** estruturar React/Vite/Router, layout shell e página técnica de conexão, `ApiClient`, testes de renderização e proxy. **Compartilhado:** Compose (3 serviços), Dockerfiles, `.env.example`, GitIgnore, hooks CI/lint, OpenAPI validado.

**Contrato:** `GET /health` → `verificarSaude` (200 JSON).

**Teste integrado:** `docker compose up --build -d` sobe `db`, `backend`, `frontend`; `curl localhost:8000/health` retorna `ok`; página web carrega e consulta saúde; build/tests passam.

**G00:** ambiente limpo sobe via README, nenhum segredo versionado; rota de API via proxy funciona.

## 4. M01 — Login, autorização e lojas

**BACK:** migrations `users`, `stores`, `user_stores`; hash de senhas e JWT; dependency `current_user` e `require_store_access`; seed 3 lojas e 2 usuários; testes acesso cruzado. **FRONT:** TELA001, TELA002, AuthProvider em memória, rota privada, loja selecionada, sidebar base e página 403.

**Contrato:** `login`, `obterPerfil`, `listarLojas`, `obterLoja`.

**Fluxo/testes:** credencial correta → listar lojas → escolher uma → shell; credencial errada 401; loja não atribuída 403; reload solicita login.

**G01:** banco persiste entidades, JWT real, nunca acessar loja de terceiros.

## 5. M02 — Métricas diárias e dashboard

**BACK:** migration `daily_metrics`; seed 60 dias/loja com datas e valores estáveis; serviço de agregação, período e conversão; endpoints com período, zero-base e limites. **FRONT:** TELA003, cards, seleção de período, gráfico e tabela, badge DEMO, empty/loading/error.

**Contrato:** `obterDashboard`, `listarMetricasDiarias`.

**Fluxo/testes:** alternar loja e período altera corretamente indicadores; soma diária coincide com dashboard; período vazio não exibe resultados inventados; usuário sem acesso recebe 403.

**G02:** dados vêm de PostgreSQL via API, não de objetos hardcoded no React.

## 6. M03 — Monitoramento demonstrativo e mapa

**BACK:** migrations `demo_cameras`, `store_zones`, `heatmap_cells`, `monitoring_snapshots`; seeds somente sintéticos; obter zonas, câmera e intensidade por data; checagem de loja. **FRONT:** TELA004 e TELA005; placeholder visual de câmera (sem vídeo real), métricas de demonstração, grid 10×8, legenda textual e filtros.

**Contrato:** `listarCamerasDemo`, `obterMonitoramentoDemo`, `listarZonas`, `obterMapaCalorDemo`.

**Fluxo/testes:** câmera lista e snapshots têm `is_simulated=true`; 80 células ou estado vazio conforme data; `intensity` válida; nenhuma captura/armazenamento de imagem pessoal.

**G03:** apresentação não sugere detecção real ou vídeo ao vivo; resultado reproduzível.

## 7. M04 — Recomendações comerciais explicáveis

**BACK:** migration `recommendations`; regras determinísticas ou seeds com justificativa (`generation_method=RULE_BASED_DEMO`), prioridade e status; transação para transições. **FRONT:** TELA006 com cards, prioridade, evidência, filtro e botões aceitar/descartar; 409 com atualização.

**Contrato:** `listarRecomendacoes`, `atualizarRecomendacao`.

**Fluxo/testes:** recomendações surgem da API, aceite persiste após reload/login, descarte funciona, estado terminal não pode ser reaberto sem contrato novo.

**G04:** nenhuma UI promete LLM ou machine learning inexistente.

## 8. M05 — Testes de ações e experimentos

**BACK:** migration `experiments`; criar a partir de recomendação aceita, estados `DRAFT/RUNNING/COMPLETED/CANCELLED`, comparação do período anterior equivalente, resultado indisponível quando falta dado. **FRONT:** TELA007 e TELA008, formulário, timeline, resultados e alerta metodológico.

**Contrato:** `listarExperimentos`, `criarExperimento`, `obterExperimento`, `alterarStatusExperimento`, `obterResultadoExperimento`.

**Fluxo/testes:** aceitar recomendação → criar experimento → iniciar → concluir → observar antes/depois; bloqueio de recomendações rejeitadas e transições inválidas.

**G05:** persistência de ciclo completo, cálculo e estado válidos; UI não atribui causalidade.

## 9. M06 — Relatórios por período

**BACK:** serviço agregador reutilizando métricas de M02; janela anterior do mesmo tamanho; variação e conversão em p.p.; não duplicar fórmulas em outro service. **FRONT:** TELA009, gráfico/tabela comparativa, filtros, empty e notas; exportar CSV client-side é opcional.

**Contrato:** `obterRelatorioComparativo`.

**Fluxo/testes:** mudança de período altera comparação; zero no período anterior produz `null` e `—`; duas lojas não trocam dados.

**G06:** todos os módulos P0/P1 estão integrados e regressão geral passa. Este é o **MVP acadêmico fechado**.

## 10. M07 — Circuito de três lojas (extensão)

**BACK:** migrations `circuits`, `circuit_stores`, `circuit_demo_stats`; admins criam circuito exatamente com 3 lojas, alteram status; estatísticas agregadas simuladas. **FRONT:** TELA010 e TELA011, seleção 3 lojas, exibição de roteiro ilustrativo e resultados, affordances por perfil.

**Contrato:** `listarCircuitos`, `criarCircuito`, `obterCircuito`, `alterarStatusCircuito`, `obterEstatisticasCircuito`.

**Fluxo/testes:** admin cria com 3 lojas distintas → ativa → vê conclusão agregada; lojista participante apenas lê; lojista de fora não visualiza detalhes.

**G07:** não se declara visita real, recompensa efetiva ou rastreamento. Se não concluído, esconder ações de circuito em produção demo.

## 11. M08 — Endurecimento e entrega

**BACK:** limites e saneamento, migrações verificadas, fixtures, logs, documentação API, smoke, backups de teste. **FRONT:** polimento, contraste, teclado, textos, navegação, screenshots e estados. **Ambos:** testes E2E amplos, Compose a partir de estado limpo, ajuste de contratos apenas sob PR de revisão.

**Contrato:** nenhum endpoint novo obrigatório.

**G08:** build reprodutível, sem permissões indevidas, sem segredos, todos os módulos marcados integrados, demo reproduzível e roteiro pronto.

## 12. Regras de paralelismo e correção de bugs

- Agente A só cria branch BACK do MXX; Agente B só cria branch FRONT do **mesmo** MXX.
- Um endpoint pode não estar pronto quando o Front inicia: fixture temporária aderente ao contrato, não uma dependência falsa de banco.
- Se teste identificar incompatibilidade de campos, corrigir a implementação que divergiu do contrato. Se contrato estiver errado, aprovar mudança conjunta primeiro.
- Uma alteração pequena em módulo fechado exige PR de correção com regressão, sem acumular alterações não relacionadas.
- Não iniciar MXX+1 com bug impeditivo de MXX. Melhorar UI esteticamente sem afetar contrato pode ser registrado como backlog.

## 13. Modelo de checkpoint de módulo

Copiar para PR e atualizar status em `10-AGENTES-GIT-E-CHECKPOINTS.md`:

```md
### CHECKPOINT MXX
- [ ] Requisitos, regras, TELA e contrato revisados
- [ ] Migration/seed (se aplicável)
- [ ] Testes backend: sucesso, falha, autorização
- [ ] Testes frontend: loading, vazio, erro e ações
- [ ] PR backend integrado na main
- [ ] Front atualizado com main e usando API real
- [ ] E2E via Docker passou
- [ ] Regressão anterior passou
- [ ] PR frontend integrado na main
- [ ] Logs, evidências e pendências documentados
- Status: PENDENTE / BACK_PRONTO / EM_INTEGRACAO / INTEGRADO
```
