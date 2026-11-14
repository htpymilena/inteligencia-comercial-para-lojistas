# Proposal

## Why

Persistir e consultar métricas DEMO diárias por loja, agregar KPIs e comparar o período anterior equivalente. O módulo atende RF003–004, RN006–012, RN028, RN030 e prepara a próxima fatia integrada sem antecipar implementação.

## What Changes

- Planejar exclusivamente o BACK M02: Métricas e dashboard.
- Operações: obterDashboard, listarMetricasDiarias.
- Persistência: daily_metrics. Testes e documentação próprios acompanham cada entrega.
- Dependências: M01; G01 INTEGRADO. Planejamento independente não dispensa integração.

## Capabilities

### New Capabilities

- `store-metrics`: Persistir e consultar métricas DEMO diárias por loja, agregar KPIs e comparar o período anterior equivalente.

### Modified Capabilities

Nenhuma. Inventário principal OpenSpec vazio nesta inspeção; as mudanças anteriores permanecem separadas.

## Impact

Implementação futura restrita a backend/** (exceto Dockerfile e infraestrutura compartilhada), reutilizando FastAPI/Pydantic, SQLAlchemy/Alembic e Python 3.12. Não modificar FRONT, Compose, CI, contrato ou M07.

Esta proposta aguarda aprovação humana. G00 permanece PENDENTE nos registros consultados. Antes de apply, exigir aprovação deste plano e gates anteriores integrados conforme sistema/06 e sistema/10; a liberação de desenvolvimento independente depende de decisão explícita da equipe, não desta proposta. Gate de saída G02 exige integração FRONT/equipe além dos checks BACK.
