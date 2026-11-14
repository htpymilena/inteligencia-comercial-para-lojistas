# Proposal

## Why

O NEXO 2031 possui documentação e contrato HTTP, mas ainda não possui aplicação, dependências ou ambiente executável. O M00 deve estabelecer uma base reproduzível e comprovar a comunicação entre navegador e API antes do M01.

## What Changes

### Responsabilidades e aprovação

Na proposta original, o usuário havia aprovado apenas o planejamento técnico do BACK: FastAPI, configuração, SQLAlchemy, Alembic, conexão PostgreSQL, `GET /health`, erros, logs e testes. O pedido de aplicação posterior autorizou o trabalho local integrado de M00; revisão e gate de equipe continuam separados da autorização de implementar.

O FRONT era atribuído a outro integrante e já existe no repositório. O pedido atual incluiu ajustes locais no frontend e nas configurações compartilhadas necessários ao M00. A revisão compartilhada de Compose, Dockerfiles, CI e demais configurações ainda não ocorreu. Nenhuma alteração do contrato HTTP foi feita.

### Entregas do módulo completo

- Planejar o monorepositório executável com PostgreSQL, FastAPI e React/Vite, configuração por ambiente e verificações automatizadas.
- Disponibilizar `GET /health`, público, com `operationId: verificarSaude` e resposta conforme `sistema/openapi.yaml`.
- Criar shell desktop e página técnica com consulta real de saúde, carregamento, falha e nova tentativa.
- Definir proxy específico de `/health` além de `/api`, sem criar `/api/v1/health` ou alterar o contrato.
- Definir checklist G00, divisão futura de responsabilidades e evidências de integração.
- Registrar a diferença entre os caminhos documentados (`docs/`) e os arquivos existentes (`sistema/`), sem mover arquivos nesta proposta.

Na aplicação já evoluída até M01–M06, a página técnica pública do M00 fica em
`/status`; a raiz mantém o fluxo de autenticação. Essa revisão preserva a
verificação de `/health` pelo mesmo domínio e evita substituir as rotas de negócio.

## Capabilities

### New Capabilities

- `local-runtime`: inicialização reproduzível dos três serviços, configuração e persistência local.
- `service-health`: consulta pública de disponibilidade HTTP conforme o contrato.
- `frontend-shell`: navegação base e diagnóstico de conexão real com a API pelo proxy.

### Modified Capabilities

Nenhuma; não há especificações principais cadastradas.

## Impact

A aplicação M00 envolve `backend/`, `frontend/`, configuração Compose, Dockerfiles, exemplos de ambiente, CI e documentação operacional na raiz do repositório. A referência contratual existente permanece `sistema/openapi.yaml`; mudanças de contrato ou reorganização documental exigem revisão específica. A execução local usou Python 3.12, PostgreSQL 16 e Node 20 na imagem de build, com dependências de aplicação fixadas por lock.

A proposta inicial entregou apenas planejamento. Na aplicação posterior foram ajustados frontend, ambiente e evidências M00, sem alterar o contrato nem fazer push. O gate G00 continua pendente de CI e revisão. Autenticação, entidades de negócio, seeds e módulos M01–M08 já existiam no repositório e permanecem fora do escopo funcional desta mudança.

O BACK poderá ser desenvolvido e verificado separadamente do FRONT e do Compose, com execução Python local e testes HTTP em processo. Testes de integração SQL exigem PostgreSQL 16 de teste acessível e credenciais fornecidas por ambiente; sua disponibilidade ainda precisa ser confirmada. O G00 completo continua dependente das entregas externas e compartilhadas.
