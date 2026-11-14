# Proposal

## Why

Listar recomendações explicáveis DEMO e aceitar/descartar com persistência e controle de concorrência. O módulo atende RF007–008, RF017, RN016–018, RN028–029 e prepara a próxima fatia integrada sem antecipar implementação.

## What Changes

- Planejar exclusivamente o BACK M04: Recomendações explicáveis.
- Operações: listarRecomendacoes, atualizarRecomendacao.
- Persistência: recommendations. Testes e documentação próprios acompanham cada entrega.
- Dependências: M02 funcional; sequência exige G03 INTEGRADO após M03. Planejamento independente não dispensa integração.

## Capabilities

### New Capabilities

- `commercial-recommendations`: Listar recomendações explicáveis DEMO e aceitar/descartar com persistência e controle de concorrência.

### Modified Capabilities

Nenhuma. Inventário principal OpenSpec vazio nesta inspeção; as mudanças anteriores permanecem separadas.

## Impact

Implementação futura restrita a backend/** (exceto Dockerfile e infraestrutura compartilhada), reutilizando FastAPI/Pydantic, SQLAlchemy/Alembic e Python 3.12. Não modificar FRONT, Compose, CI, contrato ou M07.

Planejamento técnico aprovado explicitamente pelo usuário nesta revisão. Essa aprovação não autoriza implementação neste momento nem conclui tarefas ou gates. G00 permanece PENDENTE nos registros consultados; antes de apply, conferir gates anteriores integrados conforme sistema/06 e sistema/10. Desenvolvimento independente depende de decisão explícita da equipe. O gate de saída exige integração FRONT/equipe além dos checks BACK.
