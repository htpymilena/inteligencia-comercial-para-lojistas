# NEXO 2031 — documentação de implementação web

**Versão:** 1.0.0 (baseline contratual)  
**Estado:** especificação para desenvolvimento; não representa software já implementado.  
**Escopo:** React + TypeScript, FastAPI, PostgreSQL e Docker Compose, em monorepositório, com **dois agentes** trabalhando em paralelo por **fatias verticais de módulo**.

## Objetivo

Desenvolver, passo a passo, um painel de inteligência comercial para lojistas de shopping centers. O NEXO 2031 reúne indicadores **agregados** de fluxo, vendas e zonas de atenção, recomenda ações comerciais e permite acompanhar testes de melhoria. O MVP não depende de câmeras reais nem de modelos avançados de IA; dados de demonstração e regras explicáveis são declarados como tais.

## Ler nesta ordem

| Arquivo | Finalidade | Responsáveis |
|---|---|---|
| [`docs/01-PRD.md`](docs/01-PRD.md) | O quê, por quê, para quem, escopo e critérios | Ambos |
| [`docs/02-ESPECIFICACAO-TECNICA.md`](docs/02-ESPECIFICACAO-TECNICA.md) | Arquitetura MVC adaptada, stack, camadas e padrões | Ambos |
| [`docs/03-MAPEAMENTO-TELAS.md`](docs/03-MAPEAMENTO-TELAS.md) | Rotas, telas, botões, estados e chamadas | Front + revisão do Back |
| [`docs/04-REGRAS-NEGOCIO.md`](docs/04-REGRAS-NEGOCIO.md) | Regras verificáveis e autorizações | Back + revisão do Front |
| [`docs/05-INTEGRACAO.md`](docs/05-INTEGRACAO.md) | Contratos, mocks, erros, Git e aceitação ponta a ponta | Ambos |
| [`docs/06-MAPA-MODULOS.md`](docs/06-MAPA-MODULOS.md) | Ordem de construção e entregas simultâneas por módulo | Ambos |
| [`docs/07-MODELO-DADOS.md`](docs/07-MODELO-DADOS.md) | Entidades, relacionamentos, migrations e seeds | Back + revisão do Front |
| [`docs/08-TESTES-E-QUALIDADE.md`](docs/08-TESTES-E-QUALIDADE.md) | Plano de testes unitários, contratos e E2E | Ambos |
| [`docs/09-DOCKER-E-EXECUCAO.md`](docs/09-DOCKER-E-EXECUCAO.md) | Orquestração Docker e comandos de execução | Ambos |
| [`docs/10-AGENTES-GIT-E-CHECKPOINTS.md`](docs/10-AGENTES-GIT-E-CHECKPOINTS.md) | Limites dos agentes, PRs, checkpoints e prompts | Ambos |
| [`docs/11-PRIVACIDADE-E-DEMO.md`](docs/11-PRIVACIDADE-E-DEMO.md) | Limites da simulação e proteção de dados | Ambos |
| [`docs/openapi.yaml`](docs/openapi.yaml) | **Fonte de verdade** HTTP: rotas, tipos, erros e exemplos | Ambos, revisão obrigatória |
| `AGENTS.md` | Instruções resumidas aos agentes no repositório | Ambos |

## Decisões imutáveis até revisão explícita

1. Sistema **web desktop**, com responsividade secundária; não é aplicativo mobile.
2. **Monorepositório:** `/frontend`, `/backend`, `/docs` e configuração Docker na raiz.
3. API HTTP JSON versionada em `/api/v1`; `docs/openapi.yaml` é a única referência de payloads e `operationId`.
4. Dois agentes **não** constroem todos os módulos separadamente para só integrar no final. Cada módulo é combinado (contrato → backend/testes → frontend/testes → E2E → merge → checkpoint).
5. **Backend sobe primeiro para cada integração**, nunca é necessário terminar o backend inteiro antes de começar frontend.
6. Não processar faces, não armazenar vídeo de visitantes e não alegar detecção/IA real quando os números forem simulados.
7. Sem implementação pronta neste pacote: ele entrega **documentação e contrato**, não código de aplicação.

## Evolução do produto

- **MVP obrigatório:** M00 a M06 — infraestrutura, autenticação, lojas, indicadores, monitoramento de demonstração, mapas, recomendações, experimentos e relatórios.
- **Extensão viável:** M07 — circuito cooperativo de três lojas, com eventos e métricas **simulados/agregados**.
- **Finalização:** M08 — acessibilidade, segurança, documentação, demo e testes de regressão.
- **Futuro, fora do escopo:** câmeras reais, reconhecimento de pessoas, rastreamento individual, IA treinada com dados reais, cupons de produção ou integração com POS/ERP.

## Fontes de referência

Esta documentação adapta o **Guia de documentação para desenvolvimento em paralelo** enviado e a proposta **Projeto NEXO 2031 (Web Wireframes)**: painel principal, monitoramento, mapa de calor, recomendações de IA, circuito de três lojas e relatórios. As páginas do wireframe descrevem conceitos, não funções já construídas. Decisões de implementação acrescentadas neste conjunto são **propostas técnicas do MVP**, sujeitas a revisão antes de cada módulo.
