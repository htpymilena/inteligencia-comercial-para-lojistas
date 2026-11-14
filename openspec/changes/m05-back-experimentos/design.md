# Design

## Context

Ver proposal.md para motivação. Inspeção atual: somente M00 implementado; M01 planejado e aprovado, ainda bloqueado pelo G00. Existem app/main.py, core/config.py, core/logging.py, db/base.py, db/session.py, schemas.py, Alembic vazio e testes unit/contract/integration. Não existem implementações dos módulos dependentes para reutilizar agora. Caminhos docs/ da baseline correspondem a sistema/. O contrato normativo foi consultado com regras, modelo de dados e matriz de testes. Este design descreve componentes futuros, não fatos implementados.

## Goals / Non-Goals

**Goals:** Criar experimentos a partir de recomendação aceita, controlar seu ciclo e comparar janelas completas. Integrar com autorização M01 e padrões de erros/sessão existentes após a entrega deles.

**Non-Goals:** implementar nesta etapa, alterar contrato/FRONT/infra, instalar dependências, executar SQL, commit/push/merge ou declarar gates concluídos. M07 excluído.

## Decisions

Revision após M04 cria experiments com store_id, recommendation_id, título, enum metric, datas coerentes, status, UTC e version; índice loja/created_at. FK e serviço asseguram recomendação da mesma loja. Criação transacional verifica ACCEPTED e retorna 201 DRAFT; não acrescentar regra de experimento único por recomendação ou bloqueio por data atual que contrato não exige. Título 3..140, metric VISITORS/SALES/REVENUE/CONVERSION, UUID/datas e extra forbid. DRAFT→RUNNING/CANCELLED; RUNNING→COMPLETED/CANCELLED; terminais imutáveis inclusive repetição 409. Update condicional por status/version com 404 externo e 409 conflito. Resultado usa agregador M02 com cobertura: apenas COMPLETED e cada dia das duas janelas existentes; baseline start-N..start-1 e during start..end. Available false: reason descritivo e baseline/during/changes null; nunca imputar dias. Disponível: MetricTotals/MetricChanges, percentuais null se divisor zero e conversão em p.p., aviso observacional sempre. Seed pode acrescentar um experimento completo DEMO estável dentro dos 60 dias sem alterar decisões externas.

Separação proposta: routers em app/api/v1/routers, DTOs em módulos próprios compatíveis com schemas.py existente, regra em services e SQL em repositories; modelos/revisions somente quando necessários. Não forçar nomes ou imports que dependências ainda não entregaram: antes de apply, reconciliar caminhos com a main integrada preservando este comportamento. Divergência material exige revisão humana, sem refazer contratos por conta própria.

Preferir agregação/filtragem no PostgreSQL e serviços puros para cálculos/transições; alternativas de hardcode HTTP, média de taxas, create_all e regras no controller não atendem rastreabilidade ou persistência. Para concorrência, usar update condicional/transação, não leitura seguida de escrita desprotegida.

## Testes planejados

Cenários detalhados na spec; nenhum teste executado nesta preparação. Unitários em tests/unit, PostgreSQL 16 exclusivo via TEST_DATABASE_URL em tests/integration e comparação normativa em tests/contract. Usar Python 3.12 da .venv, fixtures sintéticas e schema/base exclusivos, nunca fallback de desenvolvimento/SQLite. Não resetar, remover volumes ou apagar bancos; dados transitórios por rollback. Validar migrations em destino novo quando aplicável, seed dupla e preservação de registros externos.

Comparar operationIds (listarExperimentos, criarExperimento, obterExperimento, alterarStatusExperimento, obterResultadoExperimento), métodos, paths, query/body, required, enums, nulls, status e security ao YAML; runtime anuncia somente módulos implementados. Testar 401, 403, 404/422 conforme operação e 500 saneado; concorrência 409 somente onde contratada. Reexecutar regressão anterior, ruff, mypy e lint contratual.

## Risks / Trade-offs

- [Fabricar causalidade ou preencher lacunas; exigir cobertura diária e disclaimer.] → cenários dirigidos e evidências reais antes do aceite.
- [Dependências ainda não implementadas] → consumir contratos planejados; reconciliar com código integrado antes do apply.
- [SQL indisponível] → registrar bloqueio sem inventar aprovação de integração.
- [Gate externo] → M04 e métricas M02; G04 INTEGRADO; G05 não é aprovado só pelo BACK.

## Migration Plan

Após aprovação e gates, criar branch feat/m05-back-commercial-experiments da main atualizada. Aplicar somente migrations aprovadas em destino autorizado, sem operação destrutiva; sem migration nova quando não necessária. Fazer seed explícita e testes, preservar dados em caso de falha e corrigir por evolução controlada. Entregar evidências saneadas em backend/EVIDENCIAS-M05.md. Nenhum commit/push/merge autorizado por esta etapa de planejamento. FRONT/equipe executam E2E/Compose e revisam integração para o gate de saída.
