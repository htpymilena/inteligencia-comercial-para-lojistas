# 04 — Regras de negócio

**Convenção:** `RNxxx` = regra de domínio; `RFxxx` = requisito de produto. Regras são implementadas no backend e testadas sem depender do React. As validações de formulário no frontend são apenas UX.

## 1. Autenticação, vínculo e acesso

| ID | Regra | Validação / falha | RF |
|---|---|---|---|
| RN001 | Apenas credenciais cadastradas e ativas autenticam | Credencial incorreta ou conta inativa → 401 | RF001 |
| RN002 | JWT válido é obrigatório em `/api/v1`, exceto `/auth/login` | Ausente, expirado ou inválido → 401 | RF001, RF014 |
| RN003 | LOJISTA só pode consultar lojas ligadas em `user_stores`; ADMIN pode todas | Acesso a loja não vinculada → 403, inclusive rota direta | RF002, RF014 |
| RN004 | É proibido descobrir métricas de outra loja via cache/consulta | Toda consulta filtra `store_id` autorizado | RF014 |
| RN005 | Somente ADMIN cria/altera circuitos; LOJISTA lê circuitos que incluam suas lojas | Tentativa sem papel → 403 | RF012, RF013 |

## 2. Métricas e dashboard

| ID | Regra | Validação / falha | RF |
|---|---|---|---|
| RN006 | Períodos são datas inclusivas com `period_start <= period_end` | Data inválida → 422 | RF003, RF004, RF011 |
| RN007 | Intervalo máximo de consulta de dados = 366 dias | Maior que limite → 422 | RF003, RF004, RF011 |
| RN008 | `conversion_rate = sales_count / visitors * 100` | Quando `visitors=0`, retornar `null`, não 0 arbitrário | RF003, RF011 |
| RN009 | Variação percentual só existe com base anterior positiva | `baseline=0` → `null`; conversão compara `p.p.` | RF003, RF011 |
| RN010 | Valores financeiros são `Decimal` não-negativos com duas casas | Valores negativos/frações inválidas → 422 na ingestão/seed | RF003 |
| RN011 | `interaction_count` são eventos de interação, não visitantes únicos | Não limitar interações a visitantes | RF003 |
| RN012 | Métricas agregadas do MVP são por loja e dia, com origem `DEMO` | Não apresentar métrica fictícia como tempo real/real | RF003–RF017 |

## 3. Monitoramento e zonas

| ID | Regra | Validação / falha | RF |
|---|---|---|---|
| RN013 | Monitoramento exibe snapshots agregados de demonstração | `is_simulated=true`, origem `DEMO`, sem RTSP/WebSocket/captura | RF005 |
| RN014 | Mapa opera sobre grade 10×8 e intensidades entre 0 e 1 | Fora da grade/intervalo → erro na seed/testes; não retornar dado inválido | RF006 |
| RN015 | Zonas pertencem a uma loja e não contêm identificadores pessoais | Consulta transversal a loja → 403/404 conforme acesso | RF006, RF014 |

## 4. Recomendações e experimentos

| ID | Regra | Validação / falha | RF |
|---|---|---|---|
| RN016 | Toda recomendação tem título, hipótese, evidência, prioridade, origem e status | Dados ausentes → falha de seed/validação | RF007 |
| RN017 | Recomendação inicia `PROPOSED`; apenas `PROPOSED → ACCEPTED` ou `PROPOSED → DISMISSED` | Estado terminal tentando mudar → 409 | RF008 |
| RN018 | Recomendações demo são geradas por regras determinísticas sobre métricas agregadas ou seed | Exibir `generation_method=RULE_BASED_DEMO`; não chamar de modelo treinado | RF007, RF017 |
| RN019 | Experimento referencia recomendação `ACCEPTED` da **mesma loja** | Não aceita, não existe ou outra loja → 409/404 | RF009 |
| RN020 | Experimento exige título, datas válidas e métrica-alvo permitida | Falha → 422; início posterior ao fim → 422 | RF009 |
| RN021 | Transições do experimento: `DRAFT→RUNNING|CANCELLED`, `RUNNING→COMPLETED|CANCELLED`; terminais imutáveis | Transição proibida → 409 | RF010 |
| RN022 | Resultado antes/depois usa janela de mesma quantidade de dias e somente dados disponíveis | Falta de dados em uma janela → `available=false`, motivo sem fabricar variação | RF010, RF011 |
| RN023 | Comparações são descritivas e não alegam causalidade | Aviso obrigatório na resposta e UI | RF010, RF011 |

## 5. Circuitos de lojas

| ID | Regra | Validação / falha | RF |
|---|---|---|---|
| RN024 | Circuito contém **exatamente 3 lojas distintas** existentes | IDs repetidos, ausentes ou inválidos → 422 | RF012, RF013 |
| RN025 | Circuito possui nome, recompensa textual, início e fim coerentes; estado inicial `DRAFT` | Dados inválidos → 422 | RF013 |
| RN026 | Estado do circuito: `DRAFT→ACTIVE|CANCELLED`, `ACTIVE→FINISHED|CANCELLED`; terminais imutáveis | Transição inválida → 409 | RF013 |
| RN027 | Conclusões de circuito são contagens agregadas inventadas para demo, sem rastreamento de pessoas | `data_origin=DEMO`, sem IDs de clientes/validação real de visita | RF012, RF017 |

## 6. Integridade e segurança operacional

| ID | Regra | Resultado esperado | RF |
|---|---|---|---|
| RN028 | Seeds devem ser repetíveis/idempotentes e nunca sobrescrever dados não-demo | Segunda execução não duplica nem destrói registros externos | RF016 |
| RN029 | Atualizações de estado são atômicas/transacionais | Requisições concorrentes não produzem transição impossível; 409 em conflito | RF008, RF010, RF013 |
| RN030 | Toda resposta de erro segue `ApiError` e usa status HTTP sem vazar internals | 400/401/403/404/409/422/500 com código e mensagem estáveis | RF015 |
| RN031 | Não salvar imagens, vídeo, IPs de visitantes ou identificadores biométricos | Rejeitar funcionalidades fora de escopo; auditoria do schema | RF016, RF017 |

## 7. Exemplos de testes negativos obrigatórios

1. `LOJISTA` chama `GET /stores/{id}/dashboard` de outra loja → **403**.
2. JWT ausente/expirado em métricas → **401**.
3. Intervalo `period_start > period_end` → **422**.
4. Contagem de visitantes zero → conversão `null` e dashboard não quebra.
5. Alterar recomendação aceita para descartada → **409**.
6. Criar experimento com recomendação de outra loja → **404 ou 409** sem revelar os dados de outra loja; adotar **404** para ID externo e 409 para status interno inválido.
7. Concluir experimento ainda em `DRAFT` → **409**.
8. Criar circuito com duas lojas ou três IDs repetidos → **422**.
9. `LOJISTA` chama `POST /circuits` → **403**.
10. Seed repetida mantém mesmo total de lojas/métricas.
11. Período sem dados → `available=false` em comparação, sem porcentagens fabricadas.
12. Recomendação demonstração nunca retorna origem real ou modelo treinado.

## 8. Conflitos de regras e processo de mudança

Quando regra conflitar com interface ou código, **não corrigir silenciosamente**: abrir alteração conjunta de PRD + esta regra + OpenAPI + testes, com decisão de ambos os agentes. Para schemas HTTP, prevalece `docs/openapi.yaml`; para significado e restrição de negócio, prevalece este arquivo. Se houver inconsistência, o módulo não recebe aprovação até resolução explícita.
