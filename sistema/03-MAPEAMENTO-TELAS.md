# 03 — Mapeamento de telas e fluxos (web)

**Base visual:** seis áreas de wireframes NEXO 2031: Painel, Câmeras, Mapa, IA, Circuito e Relatórios. Login, seleção de loja e experimentos são **acréscimos de implementação**, não telas documentadas no wireframe original.

## 1. Estrutura de navegação

```text
/login
  └─ /app/lojas                 [seleção]
      └─ /app/lojas/:storeId
          ├─ /painel
          ├─ /monitoramento
          ├─ /mapa
          ├─ /recomendacoes
          ├─ /experimentos
          │    └─ /:experimentId
          └─ /relatorios
/app/circuitos
  └─ /:circuitId
```

**Layout:** sidebar persistente, topo com nome da loja e intervalo, badge `DEMONSTRAÇÃO` em telas com dados sintéticos. Desktop prioritário (`>=1024px`), sidebar retrátil em tablets; em mobile, consulta possível sem prometer paridade do painel.

## 2. Inventário e dependências

| ID | Rota | Módulo | Perfil | Operações OpenAPI |
|---|---|---|---|---|
| TELA001 | `/login` | M01 | Público | `login` |
| TELA002 | `/app/lojas` | M01 | Autenticado | `listarLojas`, `obterPerfil` |
| TELA003 | `/app/lojas/:storeId/painel` | M02 | Autorizado | `obterDashboard`, `listarMetricasDiarias` |
| TELA004 | `/app/lojas/:storeId/monitoramento` | M03 | Autorizado | `listarCamerasDemo`, `obterMonitoramentoDemo` |
| TELA005 | `/app/lojas/:storeId/mapa` | M03 | Autorizado | `listarZonas`, `obterMapaCalorDemo` |
| TELA006 | `/app/lojas/:storeId/recomendacoes` | M04 | Autorizado | `listarRecomendacoes`, `atualizarRecomendacao` |
| TELA007 | `/app/lojas/:storeId/experimentos` | M05 | Autorizado | `listarExperimentos`, `criarExperimento` |
| TELA008 | `/app/lojas/:storeId/experimentos/:experimentId` | M05 | Autorizado | `obterExperimento`, `alterarStatusExperimento`, `obterResultadoExperimento` |
| TELA009 | `/app/lojas/:storeId/relatorios` | M06 | Autorizado | `obterRelatorioComparativo` |
| TELA010 | `/app/circuitos` | M07 | Autenticado | `listarCircuitos`, `criarCircuito` (`ADMIN`) |
| TELA011 | `/app/circuitos/:circuitId` | M07 | Participante/ADMIN | `obterCircuito`, `alterarStatusCircuito`, `obterEstatisticasCircuito` |

**Guard:** usuário anônimo → `/login`; sem acesso à loja → tela 403 com voltar para `/app/lojas`; rota inválida → 404.

## 3. Comportamento de cada tela

### TELA001 — Login (M01)

- Campos: email (obrigatório, formato email) e senha (obrigatória, não exibida por padrão).
- `Entrar`: valida campos, chama `login`, guarda JWT apenas na memória, navega para TELA002.
- `Mostrar senha`: alterna visibilidade local. `Esqueci a senha`: **não exibir** no MVP, pois não há recuperação.
- Erros: 401 → credenciais inválidas; 422 → campos inválidos; erro de rede → botão tentar novamente.
- Acessibilidade: label explícita, erro associado por `aria-describedby`, Enter envia formulário.

### TELA002 — Escolher loja (M01)

- Cards de lojas retornadas por `listarLojas`: nome, segmento e indicação `DEMO`.
- `Abrir painel`: navega para `/app/lojas/:storeId/painel`; opção sem vínculo não deve aparecer.
- `Sair`: descarta token da memória e volta ao login.
- Loading, lista vazia e erro com retry.

### TELA003 — Painel principal (M02)

- Cards: visitantes, interações, vendas, conversão, faturamento; legenda da definição e origem DEMO.
- Filtro de período `period_start`/`period_end`; valores iniciais últimos 30 dias de dados demo.
- `Aplicar período`: valida datas (`início <= fim`), invalida query de `obterDashboard`/`listarMetricasDiarias`.
- Gráfico de visitantes e vendas diárias; legenda e tabela/resumo acessível.
- Card de oportunidade é somente texto estático até M04; após M04, `Ver recomendações` navega TELA006.
- Variação com base zero é `—`, não `Infinity`.
- Loading com skeleton, vazio com mensagem e erro com retry.

### TELA004 — Monitoramento (M03)

- Card `Câmera 01 — Entrada (simulação)` e painel sem vídeo real: ilustração/place-holder local de câmera.
- Exibir status `DEMO`, pessoas no momento, entradas/saídas demonstrativas e zonas observadas.
- Lista `listarCamerasDemo`, detalhe agregado `obterMonitoramentoDemo`.
- `Atualizar dados`: novo GET; **não** chamar isso de live stream nem implementar WebSocket no MVP.
- Não incluir upload de imagem, botão gravar, captura ou reconhecimento facial.

### TELA005 — Mapa de calor (M03)

- Planta esquemática renderizada em grid 10×8, zonas identificadas e células coloridas por intensidade `0..1`.
- Filtro `data` seleciona dia; `Aplicar`: chama `obterMapaCalorDemo`.
- Painel de insights textuais e legenda acessível (Baixo, Médio, Alto); informações DEMO.
- Quando sem dados, apresentar planta sem overlay e texto explicativo; não inferir emoção, gênero ou idade.

### TELA006 — Recomendações (M04)

- Cards: título, hipótese, prioridade, evidência, status e indicação de origem `DEMO`.
- Filtro status `PROPOSED`, `ACCEPTED`, `DISMISSED` ou todos.
- `Aceitar`: `atualizarRecomendacao` com `ACCEPTED`; `Descartar`: com `DISMISSED`.
- Após aceite, `Criar experimento` só fica habilitado a partir do M05 e leva à TELA007 com `recommendation_id` pré-selecionado.
- 409: explicar que status mudou e atualizar lista; erro 403: sem permissão; loading por card.

### TELA007 — Experimentos (M05)

- Listagem de experimentos da loja: nome, ação, intervalo, estado.
- `Novo experimento`: formulário título, recomendação previamente aceita, data de início/fim planejadas e métrica-alvo (`VISITORS`, `SALES`, `REVENUE`, `CONVERSION`).
- `Salvar`: `criarExperimento`, mostra sucesso e navega para detalhe TELA008.
- Validar datas, texto e seleção; API valida novamente. Empty: incentivo a aceitar recomendação.

### TELA008 — Detalhe de experimento (M05)

- Timeline `DRAFT → RUNNING → COMPLETED` ou `CANCELLED`, proposta e intervalos.
- `Iniciar`: `alterarStatusExperimento` com `RUNNING`; `Concluir`: `COMPLETED`; `Cancelar`: `CANCELLED` quando permitido.
- `Ver comparação`: `obterResultadoExperimento` (se ainda não houver dados suficientes, mostrar mensagem de indisponibilidade).
- Painel antes/depois apresenta variação e aviso: **resultado observacional, não demonstra causalidade**.
- Tratamento de 409 para transição inválida.

### TELA009 — Relatórios (M06)

- Seletores de datas com intervalo; padrão últimos 30 dias. Ao aplicar: `obterRelatorioComparativo`.
- Cards e gráficos: visitantes, interações, vendas, faturamento e conversão atual vs período anterior do mesmo tamanho.
- Variações percentuais e em pontos percentuais; legenda `DEMO` e nota de comparação descritiva.
- `Exportar CSV`: opcional somente **exportação client-side dos dados agregados já carregados**, jamais CSV com indivíduos; não criar endpoint extra para isso sem contrato.

### TELA010 — Circuitos (M07, extensão)

- Lista de circuitos disponíveis ao usuário, segmento das lojas e status.
- Para `ADMIN`: `Novo circuito` abre formulário com nome, seleção de **exatamente 3 lojas distintas**, recompensa textual e período.
- `Criar`: `criarCircuito`; para LOJISTA, botão ausente e permissão negada pela API caso tente diretamente.
- Rota individual na TELA011; métricas são demonstrativas, não validação real da visita.

### TELA011 — Detalhe de circuito (M07, extensão)

- Mostrar três lojas e sequência sugerida **ilustrativa**, recompensa e conclusão agregada demo.
- `Ativar`/`Cancelar` apenas ADMIN, via `alterarStatusCircuito`; demais apenas visualização.
- Não mostrar trajetória real, geolocalização pessoal ou identidade de visitantes.

## 4. Padrões transversais de interação

- Barra lateral navega apenas a páginas já integradas; recursos futuros podem aparecer como `Em breve` **não clicável** ou ocultos.
- Toda submissão desabilita botão enquanto em progresso e evita duplo POST.
- Toast de sucesso confirma a resposta do servidor, nunca o clique antecipadamente.
- Modais: Escape fecha, foco preso e retorno de foco ao disparador.
- `401`: limpar sessão e redirecionar ao login; `403`: tela de permissão; `409`: conflito de estado com recarga; `422`: erro de validação por campo; `5xx`: retry.
- Aplicar filtros por loja/intervalo nas chaves TanStack Query, evitando dados de outra loja em cache.
- Textos, indicadores e legenda visível não devem esconder a palavra **DEMO**.

## 5. Rastreabilidade de telas

`TELA001–002 ↔ RF001–002`; `TELA003 ↔ RF003–004`; `TELA004–005 ↔ RF005–006`; `TELA006 ↔ RF007–008`; `TELA007–008 ↔ RF009–010`; `TELA009 ↔ RF011`; `TELA010–011 ↔ RF012–013`. Todas as telas seguem `RF014–017`.
