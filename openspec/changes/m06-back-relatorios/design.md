# Design

## Context

Ver proposal.md para motivação. Inspeção atual: somente M00 implementado; M01 planejado e aprovado, ainda bloqueado pelo G00. Existem app/main.py, core/config.py, core/logging.py, db/base.py, db/session.py, schemas.py, Alembic vazio e testes unit/contract/integration. Não existem implementações dos módulos dependentes para reutilizar agora. Caminhos docs/ da baseline correspondem a sistema/. O contrato normativo foi consultado com regras, modelo de dados e matriz de testes. Este design descreve componentes futuros, não fatos implementados.

## Goals / Non-Goals

**Goals:** Comparar períodos inclusivos equivalentes usando as métricas persistidas e as fórmulas já compartilhadas. Integrar com autorização M01 e padrões de erros/sessão existentes após a entrega deles.

**Non-Goals:** implementar nesta etapa, alterar contrato/FRONT/infra, instalar dependências, executar SQL, commit/push/merge ou declarar gates concluídos. M07 excluído.

## Decisions

GET /api/v1/stores/{store_id}/reports/summary com period_start e period_end obrigatórios. DTO ComparativeReportResponse conforme YAML; reutilizar validação/agregador M02 e cobertura/comparação M05 sem duplicar fórmulas. Nenhuma tabela ou seed nova necessária. N inclusivo de 1..366; baseline [start-N,start-1]; todas as datas das duas janelas devem existir para available=true (decisão conservadora alinhada a RN022 e à política M05). Caso vazio ou parcial: available=false, reason e baseline/current/changes null, datas/origem/disclaimer mantidos. Valores registrados iguais a zero contam como dados disponíveis; taxas/variações null quando denominador zero. Conversão é taxa sobre totais; conversion_change_pp é diferença das taxas, não variação relativa. Arredondamento numérico em duas casas e dinheiro string Decimal. Não implementar exportação CSV servidor (opcional no cliente e fora do contrato).

Separação proposta: routers em app/api/v1/routers, DTOs em módulos próprios compatíveis com schemas.py existente, regra em services e SQL em repositories; modelos/revisions somente quando necessários. Não forçar nomes ou imports que dependências ainda não entregaram: antes de apply, reconciliar caminhos com a main integrada preservando este comportamento. Divergência material exige revisão humana, sem refazer contratos por conta própria.

Preferir agregação/filtragem no PostgreSQL e serviços puros para cálculos/transições; alternativas de hardcode HTTP, média de taxas, create_all e regras no controller não atendem rastreabilidade ou persistência. Para concorrência, usar update condicional/transação, não leitura seguida de escrita desprotegida.

## Testes planejados

Cenários detalhados na spec; nenhum teste executado nesta preparação. Unitários em tests/unit, PostgreSQL 16 exclusivo via TEST_DATABASE_URL em tests/integration e comparação normativa em tests/contract. Usar Python 3.12 da .venv, fixtures sintéticas e schema/base exclusivos, nunca fallback de desenvolvimento/SQLite. Não resetar, remover volumes ou apagar bancos; dados transitórios por rollback. Validar migrations em destino novo quando aplicável, seed dupla e preservação de registros externos.

Comparar operationIds (obterRelatorioComparativo), métodos, paths, query/body, required, enums, nulls, status e security ao YAML; runtime anuncia somente módulos implementados. Testar 401, 403, 404/422 conforme operação e 500 saneado; concorrência 409 somente onde contratada. Reexecutar regressão anterior, ruff, mypy e lint contratual.

## Risks / Trade-offs

- [Divergência de fórmulas e confusão zero/ausência; reutilização e testes cruzados.] → cenários dirigidos e evidências reais antes do aceite.
- [Dependências ainda não implementadas] → consumir contratos planejados; reconciliar com código integrado antes do apply.
- [SQL indisponível] → registrar bloqueio sem inventar aprovação de integração.
- [Gate externo] → M02 e M05; G05 INTEGRADO; regressão M00–M05; G06 não é aprovado só pelo BACK.

## Migration Plan

Após aprovação e gates, criar branch feat/m06-back-comparative-reports da main atualizada. Aplicar somente migrations aprovadas em destino autorizado, sem operação destrutiva; sem migration nova quando não necessária. Fazer seed explícita e testes, preservar dados em caso de falha e corrigir por evolução controlada. Entregar evidências saneadas em backend/EVIDENCIAS-M06.md. Nenhum commit/push/merge autorizado por esta etapa de planejamento. FRONT/equipe executam E2E/Compose e revisam integração para o gate de saída.
