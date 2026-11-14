# Tasks

Planejamento concluído; todas as tarefas abaixo são futuras. Executar somente após novo pedido explícito de implementação. Referências: `design.md`, três deltas em `specs/` e baseline em `sistema/`. G00 permanece PENDENTE.

**Aprovação:** somente o escopo técnico BACK foi aprovado. A fila BACK pronta para futura implementação é 3.1–3.8; a integração SQL depende de PostgreSQL de teste acessível. Grupos 1 e 2 estão pendentes de alinhamento; grupo 4 pertence a outro integrante; grupo 5 depende de ambos. A ordem numérica agrupa responsabilidades e não obriga o BACK a executar grupos compartilhados antes de seus testes locais. Nenhuma tarefa foi executada nesta revisão.

## 1. Preparação compartilhada e contrato M00 — pendente de alinhamento

- [ ] 1.1 Registrar em documentação operacional a raiz do monorepo, referências reais em `sistema/`, limites BACK/FRONT e escopo G00; verificar links e preservar o README existente, sem mover ou duplicar o contrato.
- [ ] 1.2 Validar `sistema/openapi.yaml` com ferramenta de lint fixada e registrar o subconjunto M00 (`GET /health`, `verificarSaude`, schemas 200/500 e acesso público); verificar relatório sem alterações unilaterais no contrato.
- [ ] 1.3 Registrar responsáveis e revisão compartilhada de infraestrutura/CI em entrega própria antes das entregas dependentes; verificar escopo e critérios de revisão documentados conforme `sistema/10-AGENTES-GIT-E-CHECKPOINTS.md`.
- [ ] 1.4 Conferir disponibilidade de Docker/Compose e definir versões exatas/locks das dependências de referência; verificar versões e resolução reproduzível, registrando impedimentos sem instalar programas automaticamente.

## 2. Ambiente local e infraestrutura compartilhada — pendente de alinhamento

Não executar por iniciativa do BACK: inclui os dois Dockerfiles, mesmo `backend/Dockerfile`, `.env.example`, GitIgnore e CI. A validação local do BACK usa comandos Python diretos e ambiente injetado, sem aguardar estes arquivos.

- [ ] 2.1 Criar Compose com `db`, `backend`, `frontend`, rede, volume nomeado e healthcheck do banco; verificar `docker compose config --quiet` com ambiente válido, portas HTTP em loopback e ausência de publicação da porta do banco.
- [ ] 2.2 Criar `.env.example` e regras GitIgnore para configuração local e artefatos; testar variáveis obrigatórias ausentes e conferir que `.env` está ignorado, sem segredos reais no exemplo ou nos logs.
- [ ] 2.3 Criar Dockerfiles de desenvolvimento compatíveis com manifests BACK/FRONT, locks e bind interno `0.0.0.0`; verificar build dos dois serviços após seus esqueletos estarem disponíveis, sem imagens `latest`.
- [ ] 2.4 Documentar execução PowerShell, preenchimento local de env, portas, logs e parada preservando volumes; verificar comandos em ambiente isolado e condicionar seeds ao módulo futuro correspondente.
- [ ] 2.5 Configurar CI com lint contratual e jobs BACK/FRONT, incluindo os comandos de integração onde suportados; verificar execução dos jobs e documentar eventual necessidade de evidência local para Compose/Playwright.

## 3. Backend mínimo M00 — escopo técnico aprovado

Responsável: usuário/BACK. Limite: `backend/**`, exceto Dockerfile ou qualquer configuração compartilhada. Sem alterações em `frontend/**`, contrato, raiz ou documentos de `sistema/`. Início depende de novo pedido de implementação. Manifest/lock, testes, Alembic e documentação própria ficam dentro de `backend/`.

- [x] 3.1 Criar esqueleto FastAPI/Pydantic, manifest/lock e configuração por ambiente em `backend/`; verificar startup válido e testes de falha de configuração obrigatória ausente, com diagnóstico sem segredos.
- [x] 3.2 Preparar SQLAlchemy/session e Alembic sem tabelas de negócio, seed ou `create_all`; verificar configuração com `python -m alembic heads` e comprovar que importar a aplicação e executar testes HTTP não abre conexão SQL obrigatória.
- [x] 3.3 Implementar `GET /health` público conforme `HealthResponse`, `operationId: verificarSaude` e identificação `nexo-api`; verificar pytest/httpx sem token, status 200, tipos e ausência de campos extras.
- [x] 3.4 Implementar tratamento mínimo de erro interno `ApiError` e logs com request ID, rota, método, status e duração; verificar falha controlada 500 e ausência de stack trace/SQL/segredos na resposta e credenciais nos logs.
- [x] 3.5 Comparar runtime OpenAPI ao subconjunto M00 do contrato e documentar comandos backend; verificar schemas, operationId, security, pytest, lint e tipagem, sem anunciar operações futuras como implementadas.

- [x] 3.6 Separar testes unitários/contratuais dos testes SQL e documentar os pré-requisitos em `backend/README.md`; verificar `python -m pytest tests/unit tests/contract` sem FRONT, Compose, CI ou banco ativo, usando pytest/httpx em processo e ambiente controlado.
- [ ] 3.7 Implementar verificação de integração SQL por `TEST_DATABASE_URL` exclusiva para testes; com PostgreSQL 16 acessível, verificar `SELECT 1`, ciclo de sessão/conexão e `python -m alembic current` via `python -m pytest tests/integration`, sem fallback para banco de desenvolvimento ou SQLite; sem banco/credenciais, registrar pendência explícita e manter esta tarefa desmarcada.
- [x] 3.8 Documentar execução local Python 3.12, variáveis necessárias, dependências/lock e comandos de teste em `backend/README.md`; verificar inicialização Uvicorn direta e consulta `curl.exe http://localhost:8000/health`, registrar evidências BACK e pendências sem declarar G00 integrado nem instalar ferramentas automaticamente.

## 4. Frontend mínimo M00 — outro integrante, fora do escopo BACK

Itens mantidos como referência de dependências do módulo completo, sem autorização para o usuário/BACK executá-los. Cliente `fetch`, timeout e proxy são propostas a confirmar com o responsável pelo FRONT; não modificar sua estrutura.

- [ ] 4.1 Criar React/TypeScript/Vite/Router com manifest/lock, shell e página técnica inicial; verificar renderização e navegação por teclado em Vitest/RTL, sem exigir login ou sugerir módulos funcionais inexistentes.
- [ ] 4.2 Criar cliente `fetch` tipado com base de negócios `/api/v1`, saúde em `/health`, timeout limitado e validação de resposta; verificar testes de sucesso, erro HTTP/rede/timeout e corpo vazio/inválido sem fallback para fixtures.
- [ ] 4.3 Configurar proxies Vite `/api` e `/health` para `VITE_PROXY_TARGET`, mantendo URL relativa no navegador; verificar encaminhamento de saúde e preservação do prefixo `/api` em teste de proxy, sem implementar negócio futuro.
- [ ] 4.4 Conectar página ao cliente com loading, sucesso, erro e retry manual; verificar transições em Vitest/RTL, recuperação após falha e mensagem restrita à disponibilidade HTTP.
- [ ] 4.5 Documentar scripts de teste/build e configuração pública do frontend; verificar ESLint, `tsc`, Vitest e build, conferindo que o bundle não contém segredos do backend.

## 5. Integração e evidências G00 — dependência da equipe

Pendente de alinhamento compartilhado e entrega FRONT. E2E pertence ao FRONT, com apoio BACK para sua API. Este grupo não bloqueia testes HTTP/contratuais locais do BACK, mas bloqueia a conclusão do M00 e avanço a M01.

- [ ] 5.1 Após revisão/integração BACK prevista no fluxo da equipe, atualizar o trabalho FRONT e iniciar projeto Compose isolado com `docker compose up --build -d`; verificar três serviços ativos, banco saudável e `curl.exe http://localhost:8000/health` conforme contrato.
- [ ] 5.2 Executar Playwright na página técnica em `http://localhost:5173`; verificar request real `/health` pelo proxy, sucesso, falha/recuperação e ausência de mocks ativos ou chamada a `/api/v1/health`.
- [ ] 5.3 Verificar persistência com registro técnico em banco de teste e recriação normal dos contêineres; confirmar manutenção do registro e volume, sem executar remoção de volume ou reset de banco compartilhado.
- [ ] 5.4 Reexecutar checks contratual/BACK/FRONT e smoke integrado no estado final; registrar comandos, resultados, logs saneados e captura da página, distinguindo checks executados e pendências.
- [ ] 5.5 Entregar checklist G00 para revisão com configuração limpa reproduzível, proxy funcionando, evidências e ausência de segredos; verificar que nenhum critério pendente permite marcar INTEGRADO ou avançar a M01.

## Workflow follow-up

- A publicação de branches/PRs e o merge seguem autorização e revisão da equipe; este pedido não autoriza git push.
- Marcar G00 INTEGRADO somente após revisões e integração efetivamente concluídas; até lá manter PENDENTE ou EM_INTEGRACAO conforme evidências.
- Arquivar a mudança somente após implementação e revisão, mediante pedido apropriado; este planejamento não executa apply nem archive.
