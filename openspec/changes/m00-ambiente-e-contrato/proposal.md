# Proposal

## Why

O NEXO 2031 possui documentação e contrato HTTP, mas ainda não possui aplicação, dependências ou ambiente executável. O M00 deve estabelecer uma base reproduzível e comprovar a comunicação entre navegador e API antes do M01.

## What Changes

### Responsabilidades e aprovação

O usuário aprovou o escopo técnico exclusivamente do BACK: FastAPI, configuração, SQLAlchemy, Alembic, conexão PostgreSQL, `GET /health`, erros, logs e testes. A aprovação é do planejamento; a implementação aguarda novo pedido. O trabalho futuro do BACK fica limitado a `backend/**`, seus testes, migrações e documentação local.

O FRONT será desenvolvido por outro integrante. React, TypeScript, Vite, páginas, componentes, cliente HTTP e estrutura frontend estão fora da responsabilidade do usuário/BACK. As capacidades abaixo preservam a visão completa do M00; não autorizam execução do FRONT pelo BACK. Compose, ambos os Dockerfiles (inclusive o backend), CI, `.env.example`, GitIgnore e demais configurações compartilhadas permanecem pendentes de alinhamento com o responsável pelo FRONT. Nenhuma alteração de contrato está aprovada.

### Entregas do módulo completo

- Planejar o monorepositório executável com PostgreSQL, FastAPI e React/Vite, configuração por ambiente e verificações automatizadas.
- Disponibilizar `GET /health`, público, com `operationId: verificarSaude` e resposta conforme `sistema/openapi.yaml`.
- Criar shell desktop e página técnica com consulta real de saúde, carregamento, falha e nova tentativa.
- Definir proxy específico de `/health` além de `/api`, sem criar `/api/v1/health` ou alterar o contrato.
- Definir checklist G00, divisão futura de responsabilidades e evidências de integração.
- Registrar a diferença entre os caminhos documentados (`docs/`) e os arquivos existentes (`sistema/`), sem mover arquivos nesta proposta.

## Capabilities

### New Capabilities

- `local-runtime`: inicialização reproduzível dos três serviços, configuração e persistência local.
- `service-health`: consulta pública de disponibilidade HTTP conforme o contrato.
- `frontend-shell`: navegação base e diagnóstico de conexão real com a API pelo proxy.

### Modified Capabilities

Nenhuma; não há especificações principais cadastradas.

## Impact

A implementação futura afetará `backend/`, `frontend/`, configuração Compose, Dockerfiles, exemplos de ambiente, CI e documentação operacional na raiz do repositório. A referência contratual existente permanece `sistema/openapi.yaml`; mudanças de contrato ou reorganização documental exigem revisão específica. Dependências previstas seguem a baseline local: Python 3.12, PostgreSQL 16, Node 22, FastAPI/Pydantic, SQLAlchemy/Alembic e React/TypeScript/Vite.

Esta execução cria apenas planejamento OpenSpec. Não implementa backend ou frontend, não instala ferramentas, não altera contratos, não faz push nem considera G00 aprovado. Autenticação, entidades de negócio, seeds e módulos M01–M08 ficam fora do M00.

O BACK poderá ser desenvolvido e verificado separadamente do FRONT e do Compose, com execução Python local e testes HTTP em processo. Testes de integração SQL exigem PostgreSQL 16 de teste acessível e credenciais fornecidas por ambiente; sua disponibilidade ainda precisa ser confirmada. O G00 completo continua dependente das entregas externas e compartilhadas.
