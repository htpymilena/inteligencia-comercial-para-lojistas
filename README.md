# inteligencia-comercial-para-lojistas

## Aplicação no repositório

Este monorepositório reúne `frontend/` (React e TypeScript), `backend/` (FastAPI),
`sistema/` (contrato OpenAPI e documentação) e `compose.yaml` na branch `main`.
As telas de M00 a M06 consomem a API de demonstração. O módulo M07 (circuitos de
três lojas) tem interface planejada, mas ainda não possui endpoints no backend.

Para executar o ambiente de demonstração:

1. Copie `.env.example` para `.env` e substitua todos os valores `CHANGE_ME` por
   senhas locais. `JWT_SECRET` precisa de ao menos 32 bytes.
2. Execute `docker compose up --build -d` na raiz. O backend aplica as migrations e
   carrega a seed DEMO ao iniciar.
3. Acesse `http://localhost:5173`. Use `admin@demo.invalid` ou
   `lojista@demo.invalid` com a senha definida no `.env`.

O frontend também pode ser executado com `cd frontend`, `npm ci` e `npm run dev`,
desde que a API esteja disponível em `http://localhost:8000`. Para verificar o
frontend, execute `npm run build` e `npm test` na pasta `frontend/`.

As métricas, câmeras e mapas são sintéticos. A seed usa a data atual quando
`DEMO_BASE_DATE` fica vazio; ela é idempotente e não redefine senhas já criadas.

**Em formato PDF:** [Projeto NEXO (Web Wireframes).pdf](https://github.com/user-attachments/files/34809837/Projeto.NEXO.Web.Wireframes.pdf)

**Inteligência Comercial Preditiva com Visão Computacional**

Proposta de solução: sistema web que integra análise de circulação por câmeras, recomendações comerciais, circuitos cooperativos de três lojas e relatórios de resultados.

| Categoria | Descrição |
| :--- | :--- |
| **Área** | Inteligência Artificial aplicada ao varejo |
| **Formato** | Aplicação Web (Dashboard Desktop) para o painel do lojista |
| **Tecnologia Sorteada** | Wireframes (Mapeamento Visual e Validação de Fluxo) |

**Natureza do documento:** planejamento técnico inicial estruturado primariamente através de Wireframes para apresentação acadêmica. Como a tecnologia sorteada e mandatória para a equipe foi o uso de Wireframes, o projeto migrou do formato mobile para um robusto painel Web Desktop, focado na visualização gerencial. As telas prototipadas e todos os indicadores são ilustrativos; nenhuma câmera real ou modelo preditivo final foi implementado no código, focando-se na validação estrutural da interface.

---

## 1. Contexto e problema
Lojas físicas precisam compreender como as pessoas circulam pelos espaços, quais regiões recebem maior atenção e quais ações podem melhorar a experiência de compra. Sistemas existentes já oferecem contagem de pessoas, mapas de calor e análises de conversão. O desafio desta proposta é integrar esses indicadores a um ciclo prático de decisão, teste e avaliação, acessível a lojistas em um painel claro.

## 2. Objetivo geral
Propor um sistema de inteligência comercial que converta dados agregados de movimentação e dados de vendas em hipóteses de melhoria, recomendações e experimentos monitorados, sem identificar individualmente os consumidores.

## 3. Proposta de valor
* **Observar:** estimar fluxo, entradas e concentração de pessoas por área com visão computacional.
* **Interpretar:** cruzar indicadores de circulação com dados voluntariamente fornecidos de vendas e estoque.
* **Agir:** recomendar testes de vitrine, exposição de produtos, atendimento e campanhas cooperativas.
* **Medir:** comparar resultados antes e depois de cada ação, evitando atribuir causalidade sem evidência.
* **Conectar:** oferecer circuitos voluntários de três lojas com benefícios conhecidos e sem compra obrigatória.

## 4. Diferencial competitivo proposto
O diferencial a investigar é a combinação de análise visual agregada, sugestões comerciais testáveis, acompanhamento de resultados e missões cooperativas entre três lojas independentes. As tecnologias isoladas já possuem aplicações no mercado; a originalidade comercial e eventual patenteabilidade exigem pesquisa específica de concorrentes e anterioridade.

## 5. Público-alvo
Pequenos e médios lojistas de shopping centers, administradores de centros comerciais e consumidores que optem por participar de circuitos promocionais.

---

## 6. Jornada do sistema
1. A câmera captura imagens em um ambiente autorizado. 
2. O processamento estima indicadores de movimentação. 
3. O painel web apresenta mapas e gráficos. 
4. A IA sugere uma ação e explica quais dados motivaram a sugestão. 
5. O lojista aceita ou rejeita o teste. 
6. O sistema compara os indicadores após a intervenção.

## 7. Telas previstas no aplicativo web (Wireframes)
A tecnologia central definida para esta entrega foi o mapeamento via Wireframes. Para maximizar a usabilidade, as telas foram planejadas para layout horizontal (Desktop):
* **Tela 1 - Painel principal:** Visão geral da loja: visitantes, interações estimadas, vendas integradas, conversão e alertas automáticos.
* **Tela 2 - Monitoramento por câmera:** Visualização de uma câmera de demonstração com contagem e indicadores lado a lado. Não implica reconhecimento facial.
* **Tela 3 - Mapa de calor:** Planta simplificada da loja com intensidade agregada de movimentação e insights em texto.
* **Tela 4 - Recomendações da IA:** Lista de hipóteses de melhoria, prioridade e evidências disponíveis.
* **Tela 5 - Circuito de três lojas:** Gestão de campanhas cooperativas, acompanhamento do roteiro voluntário e definição de recompensas.
* **Tela 6 - Relatórios:** Dashboards comparativos (antes/depois) de ações, circulação e conversão.

## 8. Tecnologia e arquitetura proposta
* **Tecnologia Principal (Sorteada):** Desenho estrutural baseado em Wireframes de alta fidelidade analítica para aprovação de fluxo antes da programação estrutural.
* **Aplicação Web:** Frontend projetado com React e TypeScript, adotando grid desktop focado na experiência do gerente da loja.
* **Visão computacional:** Python, OpenCV e modelo detector de pessoas, inicialmente processando vídeos de teste isolados.
* **Análise de dados e Banco:** Pandas e modelos preditivos com Scikit-learn. Dados pessoais restritos e agregados.

---

## 9. Etapas de implementação individual
* **Etapa 1 (Atual):** Planejamento técnico e construção dos Wireframes para validação de negócio.
* **Etapa 2:** MVP com vídeo demonstrativo em uma região de balcão.
* **Etapa 3:** Construção web do painel e regras de negócio de IA.
* **Etapa 4:** Testes das missões de Circuito de Lojas.
* **Etapa 5:** Avaliação preditiva e refinamento no sistema.

## 10. Privacidade e limitações
Priorizar processamento local, descarte rápido de imagens quando possível, métricas agregadas, transparência sobre a presença de câmeras e avaliação de conformidade com a LGPD. Não inferir emoções, idade, renda ou intenção individual de compra a partir de imagens.

---

## 11. Wireframes Visuais - Aplicação Web Desktop
Os wireframes a seguir representam a entrega exigida pela tecnologia sorteada. Ao pivotar de mobile para Web, adotou-se o layout de sidebar clássico de SaaS.

### Tela 1: Painel principal
**NEXO 2031 | Visão Geral**
* **Menu Lateral:** Painel, Câmeras, Mapa, IA, Circuito, Relatórios
* **Desempenho em Tempo Real (Hoje):**
    * Visitantes: 1.248 (↑ 8%)
    * Interações: 312 (↑ 12%)
    * Vendas: 198 (↑ 10%)
    * Conversão: 15,9%
* **Área Central:** [ Gráfico de Linha: Movimentação (Fluxo de Visitantes na Loja) ]
* **Alerta Base:** ✨ **IA Detectou Oportunidade:** Aumente a exposição de "Acessórios" na área central.

### Tela 2: Monitoramento por câmera
**NEXO 2031 | Feed de Monitoramento**
* **Menu Lateral:** Painel, Câmeras, Mapa, IA
* **Visor:** Câmera 01 (Loja A - Entrada) • AO VIVO
* **Estatísticas:** Pessoas Agora: 18 | Entradas: 126 | Saídas: 103
* **Área Central:** [ Vídeo Feed com Bounding Boxes em Pessoas ]
* **Zonas Observadas:**
    * Vitrine: 72% (13)
    * Corredor: 50% (9)
    * Caixa: 28% (5)

### Tela 3: Mapa de calor
**NEXO 2031 | Distribuição Espacial**
* **Menu Lateral:** Painel, Câmeras, Mapa, IA
* **Área Central (Áreas com maior circulação):** [ Planta Baixa da Loja indicando zonas "Vermelhas" no Corredor ]
* **Insights de fluxo:**
    * Corredor central concentra maior permanência.
    * Provador com baixa visitação hoje.
    * Formação de fila no caixa às 18h.

### Tela 4: Recomendações da IA
**NEXO 2031 | Recomendações Estratégicas**
* **Menu Lateral:** Painel, Câmeras, Mapa, IA, Circuito
* **Conteúdo (Ações sugeridas para melhorar resultados):**
    * **3 Oportunidades Detectadas**
    * **Reposicionar acessórios na vitrine** [Alta] - Mover itens de alto interesse para a área de visibilidade.
    * **Ajustar equipe no horário de pico** [Média] - Reforçar atendimento entre 14h e 18h devido ao alto fluxo.
    * **Criar campanha com loja vizinha** [Baixa]

### Tela 5: Circuito de 3 lojas
**NEXO 2031 | Gestão de Campanhas Cruzadas**
* **Menu Lateral:** Painel, Mapa, IA, Circuito, Relatórios
* **Missão Cooperativa:** "Missão Moda" (Status: Ativa)
* **Lojas Participantes:**
    1. Loja 1 (Roupas) - Você
    2. Loja 2 (Calçados)
    3. Loja 3 (Acessórios)
* **Visualização:** [ Mapa Interativo mostrando a rota do cliente entre as 3 lojas ]
* **Estatísticas:** 
    * Recompensa: Cupom de 15%
    * 42 Clientes Completaram o Circuito Hoje

### Tela 6: Relatórios
**NEXO 2031 | Analytics**
* **Menu Lateral:** Painel, Mapa, Circuito, Relatórios
* **Filtro:** Últimos 30 dias ▼
* **Resultados Antes x Depois das Ações:**
    * Visitas: +18%
    * Conversão: +3,2 p.p.
* **Gráficos/Dados:**
    * [ Colunas: Fluxo ] Antes 720 | Depois 850
    * [ Colunas: Permanência ] Antes 420 | Depois 510
    * [ Colunas: Vendas ] Antes 190 | Depois 230
