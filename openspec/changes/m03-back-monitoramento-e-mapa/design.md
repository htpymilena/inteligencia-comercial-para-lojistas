# Design

## Context

Ver proposal.md para motivação. Inspeção atual: somente M00 implementado; M01 planejado e aprovado, ainda bloqueado pelo G00. Existem app/main.py, core/config.py, core/logging.py, db/base.py, db/session.py, schemas.py, Alembic vazio e testes unit/contract/integration. Não existem implementações dos módulos dependentes para reutilizar agora. Caminhos docs/ da baseline correspondem a sistema/. O contrato normativo foi consultado com regras, modelo de dados e matriz de testes. Este design descreve componentes futuros, não fatos implementados.

## Goals / Non-Goals

**Goals:** Consultar câmeras fictícias, snapshot agregado, zonas e grade diária sintética sem mídia real. Integrar com autorização M01 e padrões de erros/sessão existentes após a entrega deles.

**Non-Goals:** implementar nesta etapa, alterar contrato/FRONT/infra, instalar dependências, executar SQL, commit/push/merge ou declarar gates concluídos. M07 excluído.

## Decisions

Uma revision após M02 cria as quatro tabelas, FKs de loja e constraints de counts, intensidade 0..1, coordenadas x=0..9/y=0..7 e zona contida em 10x8; unique loja/data/coordenadas e loja/nome de zona. Não criar FK de célula a zona sem coluna correspondente: a baseline concreta agrupa células por loja/dia. DTOs CameraListResponse, MonitoringDemoResponse, ZoneListResponse, HeatmapDemoResponse conforme YAML; timestamps UTC, câmera SIMULATED_ON/OFF, is_simulated=true e data_origin=DEMO. Último snapshot por captured_at com desempate estável; ausência de snapshot retorna 404, listas sem dados retornam items=[]; mapa de data sem células retorna 200 cells=[] e insights=[] com grade 10x8. Seed idempotente: uma câmera e snapshot por loja, zonas estáveis e 80 células por dia em sete dias recentes terminando em DEMO_BASE_DATE. Intensidades por fórmula fixa, sem captura, RTSP ou geração de pessoas. DTO valida JSONB zone_occupancy e pertença das zonas.

Separação proposta: routers em app/api/v1/routers, DTOs em módulos próprios compatíveis com schemas.py existente, regra em services e SQL em repositories; modelos/revisions somente quando necessários. Não forçar nomes ou imports que dependências ainda não entregaram: antes de apply, reconciliar caminhos com a main integrada preservando este comportamento. Divergência material exige revisão humana, sem refazer contratos por conta própria.

Preferir agregação/filtragem no PostgreSQL e serviços puros para cálculos/transições; alternativas de hardcode HTTP, média de taxas, create_all e regras no controller não atendem rastreabilidade ou persistência. Para concorrência, usar update condicional/transação, não leitura seguida de escrita desprotegida.

## Testes planejados

Cenários detalhados na spec; nenhum teste executado nesta preparação. Unitários em tests/unit, PostgreSQL 16 exclusivo via TEST_DATABASE_URL em tests/integration e comparação normativa em tests/contract. Usar Python 3.12 da .venv, fixtures sintéticas e schema/base exclusivos, nunca fallback de desenvolvimento/SQLite. Não resetar, remover volumes ou apagar bancos; dados transitórios por rollback. Validar migrations em destino novo quando aplicável, seed dupla e preservação de registros externos.

Comparar operationIds (listarCamerasDemo, obterMonitoramentoDemo, listarZonas, obterMapaCalorDemo), métodos, paths, query/body, required, enums, nulls, status e security ao YAML; runtime anuncia somente módulos implementados. Testar 401, 403, 404/422 conforme operação e 500 saneado; concorrência 409 somente onde contratada. Reexecutar regressão anterior, ruff, mypy e lint contratual.

## Risks / Trade-offs

- [Confundir DEMO com câmera real; auditar schema e não incluir mídia ou captura.] → cenários dirigidos e evidências reais antes do aceite.
- [Dependências ainda não implementadas] → consumir contratos planejados; reconciliar com código integrado antes do apply.
- [SQL indisponível] → registrar bloqueio sem inventar aprovação de integração.
- [Gate externo] → M02; G02 INTEGRADO; G03 não é aprovado só pelo BACK.

## Migration Plan

Após aprovação e gates, criar branch feat/m03-back-demo-monitoring da main atualizada. Aplicar somente migrations aprovadas em destino autorizado, sem operação destrutiva; sem migration nova quando não necessária. Fazer seed explícita e testes, preservar dados em caso de falha e corrigir por evolução controlada. Entregar evidências saneadas em backend/EVIDENCIAS-M03.md. Nenhum commit/push/merge autorizado por esta etapa de planejamento. FRONT/equipe executam E2E/Compose e revisam integração para o gate de saída.
