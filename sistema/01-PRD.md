# 01 — PRD | NEXO 2031

**Versão:** 1.0.0 • **Status:** baseline proposta • **Formato:** dashboard web desktop.

## 1. Contexto, problema e alinhamento ao tema

O cenário é um shopping center com lojas de segmentos distintos. Lojistas precisam compreender o comportamento de circulação, descobrir oportunidades e avaliar fatores associados ao desempenho de seus estabelecimentos. O NEXO 2031 oferece uma interface de inteligência comercial baseada em dados agregados, sem identificar consumidores.

**Problema:** informações de fluxo, interesse por áreas, períodos de pico e vendas são difíceis de interpretar em conjunto, dificultando a decisão do lojista e a avaliação posterior do resultado de suas ações.

**Hipótese do produto:** reunir indicadores, explicitar oportunidades e monitorar pequenos experimentos comerciais pode apoiar decisões melhores. Não se promete aumento de receita ou causalidade sem evidência.

## 2. Objetivos

- Visualizar movimento e desempenho por loja e período.
- Comparar fluxo, eventos de interação, número de vendas, faturamento informado e taxa de conversão.
- Exibir áreas de maior/menor movimentação por mapa de calor **demonstrativo**.
- Sugerir ações **explicáveis** de vitrine, exposição e atendimento com base em regras transparentes, não em um modelo não implementado.
- Registrar decisões e comparar indicadores **antes/depois** com alertas de limitações.
- Permitir, como extensão, visualizar campanhas cooperativas de três lojas.
- Demonstrar uma arquitetura consistente de frontend/backend integrados, testada por módulos.

## 3. Usuários e permissões

| Perfil | Necessidade | Acesso no MVP |
|---|---|---|
| `LOJISTA` | Conhecer e gerenciar indicadores de lojas atribuídas | Dashboard, monitoramento demo, mapa, recomendações, experimentos, relatórios e leitura de circuitos relacionados |
| `ADMIN` | Administrar demonstração, diferentes lojas e campanhas | Tudo o que o lojista acessa; criar/ativar/cancelar circuitos cooperativos |
| Consumidor | Não acessa este painel | Sem cadastro nem login; sua participação em circuitos é apenas uma métrica agregada fictícia |

**Assunção do MVP:** contas e lojas pré-carregadas por seed. Cadastro público, redefinição de senha e gestão avançada de usuários não fazem parte da primeira versão.

## 4. Escopo fechado do MVP

**Incluído:** login demo, seleção da loja autorizada, painéis de indicadores, série diária, monitoramento fictício, zonas e mapa de calor simulado, recomendações baseadas em regras, aceite/rejeição, criação e ciclo de experimentos, relatório comparativo, circuitos demonstrativos (extensão), testes e observabilidade básica.

**Excluído:** conexão a câmeras em produção, reconhecimento facial, identificação de indivíduos, acompanhamento de pessoas entre lojas, áudio, armazenamento de vídeos de consumidores, integração real com PDV/ERP, emissão de cupons válidos, sistema de caixa, previsão treinada/validada, aplicativo do consumidor e análise de atributos pessoais.

## 5. Requisitos funcionais

| ID | Requisito verificável | Prioridade | Módulo |
|---|---|---|---|
| RF001 | Autenticar usuário de demonstração e recuperar perfil | P0 | M01 |
| RF002 | Listar somente lojas às quais o usuário tem acesso e selecionar uma | P0 | M01 |
| RF003 | Exibir KPIs agregados por loja e período com indicação DEMO | P0 | M02 |
| RF004 | Exibir evolução diária de circulação/vendas no painel | P0 | M02 |
| RF005 | Mostrar câmeras fictícias/status de demonstração e contagens agregadas | P1 | M03 |
| RF006 | Exibir mapa de calor por zonas com escala e legenda DEMO | P1 | M03 |
| RF007 | Listar recomendações com justificativa, evidências e prioridade | P0 | M04 |
| RF008 | Aceitar ou descartar recomendação com retorno persistido | P0 | M04 |
| RF009 | Criar um experimento a partir de recomendação aceita | P1 | M05 |
| RF010 | Alterar estado permitido de experimento e consultar resultados | P1 | M05 |
| RF011 | Gerar relatório comparando o período com o anterior equivalente | P0 | M06 |
| RF012 | Listar circuitos de três lojas e visualizar conclusão agregada | P2 | M07 |
| RF013 | Criar e alterar status de circuito, somente `ADMIN` | P2 | M07 |
| RF014 | Impedir acesso a lojas não autorizadas, também via URL/API direta | P0 | M01–M08 |
| RF015 | Mostrar loading, vazio, erro e acesso negado nas telas | P0 | M01–M08 |
| RF016 | Disponibilizar dados demonstrativos previsíveis e reinicializáveis sem dados reais | P0 | M00–M08 |
| RF017 | Explicitar a origem `DEMO` de métricas e recomendações | P0 | M02–M08 |

## 6. Requisitos não funcionais

| ID | Requisito | Verificação |
|---|---|---|
| RNF001 | Stack React + TypeScript, FastAPI, PostgreSQL, Docker Compose | build e compose com 3 serviços |
| RNF002 | API `/api/v1`, contratos OpenAPI versionados | teste de schema e compatibilidade |
| RNF003 | JWT de curta duração, autorização por perfil e associação à loja | testes 401/403 e isolamento cruzado |
| RNF004 | Nenhuma mídia de pessoa real persistida; dados agregados DEMO | inspeção de modelo e seeds |
| RNF005 | Navegação por teclado, foco visível, contraste e tabelas/legendas acessíveis | verificação manual + testes UI |
| RNF006 | Estados de falha explícitos; não quebrar tela quando API/DB falha | testes com 500/timeout |
| RNF007 | Banco versionado por Alembic; migrações reversíveis quando viável | up/down em banco de testes |
| RNF008 | Testes por módulo antes de merge; regressão mínima em toda integração | CI/PR + checklist |
| RNF009 | Toda informação de IA simulada deve ser identificada | inspeção de conteúdo e UI |
| RNF010 | Timestamps RFC3339 UTC; datas de negócio em `YYYY-MM-DD` | contrato e testes de timezone |

### Metas de qualidade propostas (não resultados observados)

- Endpoints listados com p95 inferior a 500 ms em massa de teste local **sem vídeo/IA**, medidos antes de declarar cumprido.
- Fluxos E2E críticos: login → selecionar loja → dashboard; recomendação → experimento → relatório.
- Todos os *gates* M00–M06 aprovados antes da entrega acadêmica; M07 é extensão se houver tempo.

## 7. Histórias de usuário e critérios de aceitação

### HU01 — Consultar loja e desempenho (`RF001–RF004`)

Como lojista, quero entrar e selecionar minha loja para entender a evolução de fluxo e vendas.

**Aceite:** credencial válida autentica; loja não vinculada responde 403; período com dados exibe cards e gráfico; período sem dados mostra estado vazio; origem `DEMO` é visível; conversão não divide por zero.

### HU02 — Visualizar ocupação por área (`RF005–RF006`)

Como lojista, quero visualizar zonas com alta circulação para considerar mudanças de exposição.

**Aceite:** mapa exibe legenda, zonas e intensidade agregada; conteúdo é explicitamente simulado; nenhuma pessoa é identificável; erros de rede são tratados.

### HU03 — Priorizar ações comerciais (`RF007–RF008`)

Como lojista, quero sugestões justificadas e poder aceitá-las ou descartá-las.

**Aceite:** cada recomendação informa prioridade, base de evidência, status e origem da simulação; ação altera status no banco; dupla atualização conflitante gera 409.

### HU04 — Medir experimento (`RF009–RF011`)

Como lojista, quero criar uma ação de melhoria e comparar o período antes/depois.

**Aceite:** somente recomendação aceita origina experimento; estados respeitam transições; cálculo compara janelas equivalentes; tela alerta que comparação não comprova causalidade.

### HU05 — Campanha cooperativa (`RF012–RF013`)

Como administrador, quero simular um circuito entre três lojas para explorar campanhas cruzadas.

**Aceite:** exatamente três IDs distintos, período válido, regra de permissão; métricas de conclusão são agregadas demonstrativas; nenhuma localização individual é armazenada.

## 8. Prioridades e dependências

**P0:** M00 → M01 → M02 → M04 → M06; **P1:** M03, M05; **P2:** M07. A ordem **de desenvolvimento** não deve pular dependências: seguir a sequência integrada de `06-MAPA-MODULOS.md`. Prioridade indica relevância de produto, não autoriza ignorar o *gate* de módulo.

## 9. Métricas de produto (definições)

- **Visitantes:** contagem agregada *estimada* da entrada durante um período, não pessoas únicas verificadas.
- **Interações:** eventos estimados de passagem/permanência em zonas, não pessoas distintas; pode superar visitantes.
- **Vendas:** quantidade de transações fornecidas pela base demo.
- **Conversão:** `vendas / visitantes × 100`; quando visitantes = 0, valor **nulo** (`—` na UI).
- **Faturamento:** soma informada de receitas demo em BRL, não conciliação de caixa.
- **Variação percentual:** `(atual − anterior) / anterior × 100`; se anterior = 0, exibir `—`.
- **Diferença de conversão:** pontos percentuais (`p.p.`), não variação percentual.

## 10. Restrições, riscos e validação

Riscos: confundir indicadores fictícios com medições reais, exagerar papel da IA, dificuldade em comprovar efeito de campanhas e criação de perfis de consumo individual. Mitigações: rótulos `DEMO`, metadados de origem, regras explicáveis, sem dados pessoais de consumidores, exemplos determinísticos e linguagem de associação, não causalidade.

**Aprovação acadêmica:** demonstrar que o sistema trata comportamento agregado, oportunidades e fatores de desempenho; apresentar os seis núcleos dos wireframes (painel, câmeras, mapa, recomendações, circuito, relatórios), deixando claro o status implementado/simulado.
