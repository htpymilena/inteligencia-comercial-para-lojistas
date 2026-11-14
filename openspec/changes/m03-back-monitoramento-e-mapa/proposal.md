# Proposal

## Why

Consultar câmeras fictícias, snapshot agregado, zonas e grade diária sintética sem mídia real. O módulo atende RF005–006, RN013–015, RN028, RN031 e prepara a próxima fatia integrada sem antecipar implementação.

## What Changes

- Planejar exclusivamente o BACK M03: Monitoramento e mapa DEMO.
- Operações: listarCamerasDemo, obterMonitoramentoDemo, listarZonas, obterMapaCalorDemo.
- Persistência: demo_cameras, store_zones, heatmap_cells, monitoring_snapshots. Testes e documentação próprios acompanham cada entrega.
- Dependências: M02; G02 INTEGRADO. Planejamento independente não dispensa integração.

## Capabilities

### New Capabilities

- `demo-monitoring`: Consultar câmeras fictícias, snapshot agregado, zonas e grade diária sintética sem mídia real.

### Modified Capabilities

Nenhuma. Inventário principal OpenSpec vazio nesta inspeção; as mudanças anteriores permanecem separadas.

## Impact

Implementação futura restrita a backend/** (exceto Dockerfile e infraestrutura compartilhada), reutilizando FastAPI/Pydantic, SQLAlchemy/Alembic e Python 3.12. Não modificar FRONT, Compose, CI, contrato ou M07.

Planejamento técnico aprovado explicitamente pelo usuário nesta revisão. Essa aprovação não autoriza implementação neste momento nem conclui tarefas ou gates. G00 permanece PENDENTE nos registros consultados; antes de apply, conferir gates anteriores integrados conforme sistema/06 e sistema/10. Desenvolvimento independente depende de decisão explícita da equipe. O gate de saída exige integração FRONT/equipe além dos checks BACK.
