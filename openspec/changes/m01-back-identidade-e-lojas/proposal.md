# Proposal

## Why

O BACK M00 disponibiliza saúde HTTP, mas ainda não autentica usuários nem restringe acesso por loja. O M01 deve fornecer a identidade e o isolamento exigidos por RF001, RF002 e RF014 antes de qualquer módulo de métricas.

## What Changes

- Planejar exclusivamente o BACK M01: migrations de `users`, `stores` e `user_stores`, credenciais com hash e JWT real.
- Implementar futuramente `login`, `obterPerfil`, `listarLojas` e `obterLoja`, sem mudar `sistema/openapi.yaml`.
- Aplicar RN001–004: conta ativa, token válido, ADMIN com todas as lojas e LOJISTA somente com vínculos autorizados; erros conforme RN030.
- Criar seed explícita e idempotente de três lojas fictícias e dois usuários, com senhas somente por ambiente e sem sobrescrever registros externos (RN028).
- Verificar contrato, autorização, persistência, migrations, logs saneados e regressão M00.

## Capabilities

### New Capabilities

- `user-auth`: autenticação por credenciais, JWT e perfil público do usuário autenticado.
- `store-access`: listagem e detalhe de lojas com autorização por vínculo e papel.
- `identity-demo-seed`: provisionamento explícito, persistente e repetível das identidades e lojas de demonstração.

### Modified Capabilities

Nenhuma. Não há specs principais cadastradas; o delta M00 permanece separado e seus requisitos não são alterados.

## Impact

A implementação futura afeta somente `backend/**` (exceto Dockerfile e infraestrutura compartilhada), reutilizando FastAPI, Pydantic, SQLAlchemy, Alembic e Python 3.12. Inclui dependências fixadas para JWT, Argon2 e validação de email, configuração de segredos e testes com PostgreSQL 16 exclusivo de teste. Não inclui FRONT, Compose, CI, alterações de contrato, M02–M08 ou M07 opcional.

**Estado observado em 14/11/2026:** G00 PENDENTE nos registros locais; M00 tem 8/27 tarefas concluídas, todas do BACK. Faltam entregas compartilhadas, FRONT e evidências integradas. A proposta é preparação documental independente; não autoriza implementação nem dispensa o gate. Implementar somente após aprovação explícita desta proposta e comprovação do G00 INTEGRADO pela equipe. O prazo de 30 minutos não reduz os critérios de aceite.

A branch futura será `feat/m01-back-identidade-lojas`, criada da `main` atualizada após integração M00. Nenhum merge na main será feito pelo agente. Esta etapa não cria commit ou push de módulo implementado e não declara G01 concluído.
