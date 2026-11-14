# Design

## Context

Ver `proposal.md` para motivação. A inspeção encontrou somente documentação em `sistema/`, README raiz, habilidades e configuração OpenSpec; não existem aplicações, manifests, Compose ou testes para reutilizar. O schema configurado é `spec-driven`, sem contexto ou regras customizadas. Este design é necessário por envolver frontend, backend e infraestrutura.

Foram consultados README, arquitetura, mapa de módulos, integração, Docker, testes, instruções de agentes e contrato. Os documentos fazem referência a `docs/`, mas o contrato existente está em `sistema/openapi.yaml`. A baseline define `/health` na raiz, público, e negócios em `/api/v1`. O proxy de referência cobre apenas `/api`, insuficiente para o diagnóstico M00.

## Goals / Non-Goals

**Goals:** resolver inicialização, fronteiras de configuração, proxy de saúde, testes e critérios de evidência antes de escrever código; manter compatibilidade com o contrato existente.

**Non-Goals:** nesta execução não criar aplicação, infraestrutura executável ou branches; não instalar programas, executar serviços ou publicar alterações. Na implementação M00 não criar login, tabelas de negócio, seeds, monitoramento ou dashboard. O gate permanece PENDENTE até execução real.

## Decisions

### Estado de aprovação e limites de execução

O escopo técnico BACK foi aprovado pelo usuário, sem autorização para implementar nesta revisão. FRONT é entrega de outro integrante; o BACK não cria nem modifica sua estrutura. Compose, ambos os Dockerfiles, CI, `.env.example`, GitIgnore e demais padrões compartilhados ficam pendentes de alinhamento. As decisões abaixo relativas a esses itens são propostas para o módulo completo, não decisões aprovadas para execução pelo BACK. Em particular, `fetch`, timeout de 10 segundos, proxy Vite e layout dependem do responsável pelo FRONT.

1. **Raiz operacional do monorepositório:** planejar `backend/`, `frontend/` e Compose na raiz atual, junto do OpenSpec. Preservar `sistema/` como documentação existente e usar seus caminhos reais em verificações e instruções novas. Mover tudo para `sistema/` ou reorganizar para `docs/` ampliaria escopo sem benefício para o G00; uma futura reorganização requer revisão própria. A futura documentação operacional deve apontar explicitamente para `sistema/AGENTS.md` e preservar o README descritivo existente.

2. **Compose de desenvolvimento:** três serviços, rede interna e volume nomeado; PostgreSQL 16, Python 3.12 slim e Node 22 Alpine conforme baseline. Backend depende do healthcheck do banco; Vite/Uvicorn escutam `0.0.0.0` dentro dos contêineres, portas host ligadas a `127.0.0.1`. Banco não publica porta. Versões exatas, lockfiles e imagens sem `latest` serão registrados na implementação; este plano não verifica disponibilidade atual de pacotes.

3. **Saúde não versionada:** manter `GET /health`, `verificarSaude`, `HealthResponse` e erro 500 `ApiError`. Não criar alias de API. `/health` mede liveness HTTP; conexão SQL é verificada em teste separado e Compose, conforme arquitetura local. Incorporar banco à resposta alteraria sua semântica e confundiria diagnóstico HTTP com readiness. OpenAPI runtime M00 deve anunciar somente operações implementadas, comparando o subconjunto M00 ao contrato completo.

4. **Cliente e proxies:** adotar `fetch` tipado em cliente único, sem dependência HTTP adicional. Base `/api/v1` para negócios e caminho raiz explícito para saúde. Vite encaminha `/api` e `/health` a `VITE_PROXY_TARGET=http://backend:8000`. Usar mesma origem elimina necessidade de URL interna no navegador. Adicionar timeout limitado (proposta: 10 segundos), tratamento de status/corpo inválido e nova tentativa manual. Fixtures apenas em testes; não usar fallback de sucesso. Proxy de saúde é ajuste de infraestrutura, sem edição de contrato.

5. **Configuração e estrutura mínima:** `.env.example` contém placeholders; `.env` ignorado. Configuração validada no startup, logs em stdout com request ID, método, rota, status e duração, sem credenciais. Preparar SQLAlchemy/session e Alembic vazios, sem tabelas, seed ou `create_all`. Variáveis JWT e senhas demo permanecem reservadas no modelo de ambiente de referência; suas funcionalidades pertencem a M01. Não exigir seed inexistente para aprovar M00.

6. **Shell técnico:** React/TypeScript/Vite/Router com layout desktop mínimo e página técnica inicial pública. Sem telas de negócio fictícias. Loading, sucesso, erro e retry; resposta vazia é erro, pois não há coleção de saúde. Navegação e mensagens acessíveis. A tela informa disponibilidade HTTP, sem alegar banco ou módulos funcionais.

7. **Entrega futura em áreas separadas:** infraestrutura/CI/padrões em revisão compartilhada própria antes do código dependente; BACK em `backend/**`, FRONT em `frontend/**`, conforme baseline. Back validado e integrado antes da integração final do Front. Nenhuma delegação ou operação Git remota é realizada por este planejamento. Implementação exige novo pedido explícito.

8. **Verificação independente do BACK:** código, manifest/lock Python, configuração Alembic, testes e instruções de execução ficam em `backend/**`, exceto `backend/Dockerfile`, que permanece compartilhado e pendente. A configuração é injetada por variáveis de ambiente, sem depender de `.env` raiz, Compose, Node, navegador ou CI. Documentar em `backend/README.md` execução local com Python 3.12 e comandos a partir de `backend/`: `python -m pytest tests/unit tests/contract`, `python -m pytest tests/integration`, `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`, `python -m alembic heads` e `python -m alembic current` (este último com banco de teste). Os diretórios e dependências serão criados somente na implementação. Não instalar ferramentas automaticamente.

9. **Separação dos testes HTTP e SQL:** pytest/httpx exercitam a aplicação em processo, com ambiente de teste controlado, sem conexão SQL obrigatória na importação ou em `/health`. A falta de uma variável obrigatória é testada explicitamente; configurações sintaticamente válidas não equivalem a banco acessível. SQLAlchemy/Alembic recebem uma URL exclusiva por `TEST_DATABASE_URL`, usada apenas pelo runner de integração; os testes não usam a base de desenvolvimento como fallback. Um PostgreSQL 16 de teste pode ser local ou fornecido pela equipe, sem exigir Compose. Sem ele, registrar integração SQL como pendente e não declarar BACK plenamente validado. Não substituir PostgreSQL por SQLite para comprovar compatibilidade.

10. **Aceite parcial e aceite do módulo:** os testes independentes permitem entregar evidências BACK sem esperar o FRONT. Configuração Alembic é verificada sem migrações de negócio; `SELECT 1` comprova a conexão real. Healthcheck de contêiner, persistência de volume, proxy e navegador continuam no G00 completo. BACK_PRONTO depende de verificações BACK reais; não significa INTEGRADO, não libera M01 e não conclui automaticamente esta mudança.

## Risks / Trade-offs

- [Caminhos `docs/` inconsistentes com disco] → usar `sistema/` como referência real e documentar o mapeamento; não criar contrato duplicado.
- [Proxy `/api` não atende saúde] → proxy `/health` específico e E2E pelo domínio do frontend, além do teste direto em 8000.
- [HTTP saudável interpretado como banco pronto] → teste independente `SELECT 1` em banco de teste e healthcheck do Compose.
- [Versões e ferramentas ainda não verificadas] → verificar Docker/Compose e resolver locks na implementação; não reinstalar ferramentas nesta etapa.
- [Frontend inicia antes da API estar pronta] → estado de carregamento/falha e retry; E2E aguarda disponibilidade com timeout finito.
- [Volume ou porta compartilhados com outro ambiente] → projeto Compose isolado para testes, sem reset de volume compartilhado.
- [Documentação sugere seed após M00] → comandos de seed ficam explicitamente condicionados ao módulo que os implementar.
- [Vite dev exposto como produção] → documentar uso local; publicação real fora do M00.

## Migration Plan

1. Após novo pedido explícito, implementar somente o BACK aprovado em `backend/**`, excluindo Dockerfile; documentar execução local e testes sem dependência das entregas compartilhadas.
2. Validar HTTP/contrato em processo e SQL contra banco de teste acessível; registrar separadamente qualquer dependência indisponível. FRONT e infraestrutura não são pré-requisitos dos testes HTTP.
3. Em etapa posterior, após alinhamento com o responsável pelo FRONT, a equipe entrega infraestrutura e FRONT e executa as verificações G00; não alterar tais áreas por iniciativa do BACK.
4. Registrar comandos, resultados e evidências; somente considerar M00 integrado após revisão e integração previstas pela equipe. M01 depende de G00.
5. Recuperação local: parar serviços ou remover apenas contêineres preservando volume. Não executar `down -v`, reset de banco ou migração destrutiva automaticamente. Como não há schema de negócio no M00, não há migração de dados de domínio.

## Verificação planejada e gate G00

- Lint do OpenAPI existente e comparação da operação M00 com `/openapi.json`, sem exigir endpoints futuros no runtime.
- Backend: pytest/httpx para saúde pública, corpo exato, erro controlado, configuração inválida e conexão SQL em banco isolado; lint e tipagem.
- Execução independente: testes unitários/HTTP/contrato sem banco ativo; integração SQL separada por `TEST_DATABASE_URL`. Python, dependências e PostgreSQL de teste ainda não foram verificados nesta revisão. A indisponibilidade do banco não autoriza marcar integração SQL como aprovada.
- Frontend: Vitest/RTL para shell, teclado, loading, sucesso, corpo vazio/inválido, erro e retry; ESLint, TypeScript e build.
- Infraestrutura: validação Compose, três serviços ativos, DB saudável, portas corretas e persistência após recriação não destrutiva em projeto de testes.
- Integração: `curl.exe http://localhost:8000/health` e Playwright em `http://localhost:5173` comprovando request `/health` pelo proxy, recuperação e ausência de mocks ativos.
- Registrar logs saneados, captura da página e resultados reais. Se CI não comportar Compose/Playwright, registrar evidência local reproduzível e a lacuna. Nenhum destes testes foi executado nesta etapa de planejamento.
