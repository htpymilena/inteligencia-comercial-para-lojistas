# Proposal

## Why

Comparar períodos inclusivos equivalentes usando as métricas persistidas e as fórmulas já compartilhadas. O módulo atende RF011, RN006–012, RN022–023 e prepara a próxima fatia integrada sem antecipar implementação.

## What Changes

- Planejar exclusivamente o BACK M06: Relatórios comparativos.
- Operações: obterRelatorioComparativo.
- Persistência: nenhuma migration obrigatória. Testes e documentação próprios acompanham cada entrega.
- Dependências: M02 e M05; G05 INTEGRADO; regressão M00–M05. Planejamento independente não dispensa integração.

## Capabilities

### New Capabilities

- `comparative-reports`: Comparar períodos inclusivos equivalentes usando as métricas persistidas e as fórmulas já compartilhadas.

### Modified Capabilities

Nenhuma. Inventário principal OpenSpec vazio nesta inspeção; as mudanças anteriores permanecem separadas.

## Impact

Implementação futura restrita a backend/** (exceto Dockerfile e infraestrutura compartilhada), reutilizando FastAPI/Pydantic, SQLAlchemy/Alembic e Python 3.12. Não modificar FRONT, Compose, CI, contrato ou M07.

Planejamento técnico aprovado explicitamente pelo usuário nesta revisão. Essa aprovação não autoriza implementação neste momento nem conclui tarefas ou gates. G00 permanece PENDENTE nos registros consultados; antes de apply, conferir gates anteriores integrados conforme sistema/06 e sistema/10. Desenvolvimento independente depende de decisão explícita da equipe. O gate de saída exige integração FRONT/equipe além dos checks BACK.
