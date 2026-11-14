# Design

## Context

Ver proposal.md para motivação. Inspeção atual: somente M00 implementado; M01 planejado e aprovado, ainda bloqueado pelo G00. Existem app/main.py, core/config.py, core/logging.py, db/base.py, db/session.py, schemas.py, Alembic vazio e testes unit/contract/integration. Não existem implementações dos módulos dependentes para reutilizar agora. Caminhos docs/ da baseline correspondem a sistema/. O contrato normativo foi consultado com regras, modelo de dados e matriz de testes. Este design descreve componentes futuros, não fatos implementados.

## Goals / Non-Goals

**Goals:** Persistir e consultar métricas DEMO diárias por loja, agregar KPIs e comparar o período anterior equivalente. Integrar com autorização M01 e padrões de erros/sessão existentes após a entrega deles.

**Non-Goals:** implementar nesta etapa, alterar contrato/FRONT/infra, instalar dependências, executar SQL, commit/push/merge ou declarar gates concluídos. M07 excluído.

## Decisions

**RN010 — validação anterior à persistência:** receitas devem ser Decimal finitas, não negativas e exatamente representáveis com duas casas. Validar antes de adicionar/enviar dados ao repositório: rejeitar negativos, NaN, Infinity e frações menores que um centavo; nunca corrigir entrada inválida com arredondamento. Valores como 1.230 são exatos em centavos e podem ser normalizados para 1.23; 1.234 deve ser rejeitado. Validar também o limite de numeric(14,2), acrescentar CHECK revenue_brl >= 0 como defesa adicional e não depender da coerção do PostgreSQL. Saída monetária sempre string com duas casas. Nenhum endpoint de ingestão novo é criado: o M02 tem apenas GETs; seed falha com diagnóstico saneado e rollback sem gravar valores inválidos. Uma futura ingestão HTTP, se contratada, usaria 422 ApiError conforme RN010.

**RN011 — eventos independentes:** interaction_count pode superar visitor_count, inclusive em um dia com zero visitantes. Não aplicar constraint ou validação interaction_count <= visitor_count; cada contagem continua inteira e não negativa.

**Exemplos e testes:** números e datas dos cenários são fixtures, não constantes de resposta ou limites das regras gerais. Prever testes unitários com -0.01 e 1.234 rejeitados antes da chamada de escrita, 0.00 e 1.23 aceitos, NaN/Infinity rejeitados e 150 interações para 100 visitantes aceitas. Na integração SQL, conferir receita negativa bloqueada pela constraint e nenhuma escrita parcial após seed inválida. Não testar 422 em rota de ingestão inexistente.

Migration daily_metrics com FK store_id, unique(store_id, metric_date), counts >= 0, numeric(14,2) e origem DEMO. Agregação SQL por loja/data e cálculo Decimal em serviço compartilhado de métricas, reutilizável em M05/M06; dinheiro como string de duas casas. Período inclusivo N=(end-start)+1, 1..366 dias; baseline [start-N,start-1]. Conversão sobre totais, arredondamento de resposta a duas casas; visitantes=0 retorna null e baseline zero gera variação null. Série ordenada crescente somente com dias persistidos, sem preencher lacunas. Janela vazia: totais reais zero, receita 0.00, conversão null, items vazio; variação depende do total anterior. Preparar serviço para informar cobertura diária completa sem confundir dias ausentes com zero. Seed explícita de 60 dias por loja terminando em DEMO_BASE_DATE (padrão data local da execução), fórmula fixa baseada em índice de dia/loja, IDs estáveis, sem sobrescrever dados externos.

Separação proposta: routers em app/api/v1/routers, DTOs em módulos próprios compatíveis com schemas.py existente, regra em services e SQL em repositories; modelos/revisions somente quando necessários. Não forçar nomes ou imports que dependências ainda não entregaram: antes de apply, reconciliar caminhos com a main integrada preservando este comportamento. Divergência material exige revisão humana, sem refazer contratos por conta própria.

Preferir agregação/filtragem no PostgreSQL e serviços puros para cálculos/transições; alternativas de hardcode HTTP, média de taxas, create_all e regras no controller não atendem rastreabilidade ou persistência. Para concorrência, usar update condicional/transação, não leitura seguida de escrita desprotegida.

## Testes planejados

Cenários detalhados na spec; nenhum teste executado nesta preparação. Unitários em tests/unit, PostgreSQL 16 exclusivo via TEST_DATABASE_URL em tests/integration e comparação normativa em tests/contract. Usar Python 3.12 da .venv, fixtures sintéticas e schema/base exclusivos, nunca fallback de desenvolvimento/SQLite. Não resetar, remover volumes ou apagar bancos; dados transitórios por rollback. Validar migrations em destino novo quando aplicável, seed dupla e preservação de registros externos.

Comparar operationIds (obterDashboard, listarMetricasDiarias), métodos, paths, query/body, required, enums, nulls, status e security ao YAML; runtime anuncia somente módulos implementados. Testar 401, 403, 404/422 conforme operação e 500 saneado; concorrência 409 somente onde contratada. Reexecutar regressão anterior, ruff, mypy e lint contratual.

## Risks / Trade-offs

- [Datas móveis da demo e média indevida de taxas; fixar DEMO_BASE_DATE em testes e calcular sobre totais.] → cenários dirigidos e evidências reais antes do aceite.
- [Dependências ainda não implementadas] → consumir contratos planejados; reconciliar com código integrado antes do apply.
- [SQL indisponível] → registrar bloqueio sem inventar aprovação de integração.
- [Gate externo] → M01; G01 INTEGRADO; G02 não é aprovado só pelo BACK.

## Migration Plan

Após aprovação e gates, criar branch feat/m02-back-store-metrics da main atualizada. Aplicar somente migrations aprovadas em destino autorizado, sem operação destrutiva; sem migration nova quando não necessária. Fazer seed explícita e testes, preservar dados em caso de falha e corrigir por evolução controlada. Entregar evidências saneadas em backend/EVIDENCIAS-M02.md. Nenhum commit/push/merge autorizado por esta etapa de planejamento. FRONT/equipe executam E2E/Compose e revisam integração para o gate de saída.
