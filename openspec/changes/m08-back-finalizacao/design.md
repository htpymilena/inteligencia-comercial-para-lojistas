# Design

## Context

Ver proposal.md para motivação. Inspeção atual: somente M00 implementado; M01 planejado e aprovado, ainda bloqueado pelo G00. Existem app/main.py, core/config.py, core/logging.py, db/base.py, db/session.py, schemas.py, Alembic vazio e testes unit/contract/integration. Não existem implementações dos módulos dependentes para reutilizar agora. Caminhos docs/ da baseline correspondem a sistema/. O contrato normativo foi consultado com regras, modelo de dados e matriz de testes. Este design descreve componentes futuros, não fatos implementados.

## Goals / Non-Goals

**Goals:** Verificar segurança, limites, migrations, restauração de teste e reprodução da entrega do BACK sem ampliar contrato. Integrar com autorização M01 e padrões de erros/sessão existentes após a entrega deles.

**Non-Goals:** implementar nesta etapa, alterar contrato/FRONT/infra, instalar dependências, executar SQL, commit/push/merge ou declarar gates concluídos. M07 excluído.

## Decisions

Revisão final restrita ao backend, reutilizando suites e fixtures dos módulos anteriores; corrigir somente falhas demonstradas dentro dos requisitos, sem refatoração transversal. Auditar queries por loja, JWT, ApiError, logs e limites contratuais; não introduzir quotas ou novo endpoint sem contrato aprovado. Validar cadeia Alembic de base vazia até head em base/schema exclusivo e seed dupla com data-base fixa. Planejar pg_dump de base exclusivamente sintética e restauração em nova base/schema de teste autorizada, sem sobrescrever destino existente e sem URL com credenciais em argumentos/logs; usar configuração local protegida, artefatos fora do Git. Rollback destrutivo não autorizado; verificar script reverso offline e documentar limites. Só índices necessários por EXPLAIN e dados medidos entram em migration controlada. Documentar smoke HTTP de login→loja→dashboard→recomendação→experimento→relatório, DTOs e limites DEMO, comandos .venv e evidências saneadas; medir p95 antes de afirmar meta 500ms. E2E browser, Compose limpo, UI e CI pertencem à equipe, registrados como dependências externas sem editá-los. Nenhum módulo/gate concluído por mera passagem de testes BACK.

Separação proposta: routers em app/api/v1/routers, DTOs em módulos próprios compatíveis com schemas.py existente, regra em services e SQL em repositories; modelos/revisions somente quando necessários. Não forçar nomes ou imports que dependências ainda não entregaram: antes de apply, reconciliar caminhos com a main integrada preservando este comportamento. Divergência material exige revisão humana, sem refazer contratos por conta própria.

Preferir agregação/filtragem no PostgreSQL e serviços puros para cálculos/transições; alternativas de hardcode HTTP, média de taxas, create_all e regras no controller não atendem rastreabilidade ou persistência. Para concorrência, usar update condicional/transação, não leitura seguida de escrita desprotegida.

## Testes planejados

Cenários detalhados na spec; nenhum teste executado nesta preparação. Unitários em tests/unit, PostgreSQL 16 exclusivo via TEST_DATABASE_URL em tests/integration e comparação normativa em tests/contract. Usar Python 3.12 da .venv, fixtures sintéticas e schema/base exclusivos, nunca fallback de desenvolvimento/SQLite. Não resetar, remover volumes ou apagar bancos; dados transitórios por rollback. Validar migrations em destino novo quando aplicável, seed dupla e preservação de registros externos.

Comparar operationIds (nenhuma operação nova; regressão de todas as operações implementadas M00–M06), métodos, paths, query/body, required, enums, nulls, status e security ao YAML; runtime anuncia somente módulos implementados. Testar 401, 403, 404/422 conforme operação e 500 saneado; concorrência 409 somente onde contratada. Reexecutar regressão anterior, ruff, mypy e lint contratual.

## Risks / Trade-offs

- [Confundir BACK validado com entrega integrada; G08 depende também da equipe e de evidências externas.] → cenários dirigidos e evidências reais antes do aceite.
- [Dependências ainda não implementadas] → consumir contratos planejados; reconciliar com código integrado antes do apply.
- [SQL indisponível] → registrar bloqueio sem inventar aprovação de integração.
- [Gate externo] → M00–M06 integrados; G06 INTEGRADO; M07 dispensado sem autorização; G08 não é aprovado só pelo BACK.

## Migration Plan

Após aprovação e gates, criar branch feat/m08-back-backend-release-readiness da main atualizada. Aplicar somente migrations aprovadas em destino autorizado, sem operação destrutiva; sem migration nova quando não necessária. Fazer seed explícita e testes, preservar dados em caso de falha e corrigir por evolução controlada. Entregar evidências saneadas em backend/EVIDENCIAS-M08.md. Nenhum commit/push/merge autorizado por esta etapa de planejamento. FRONT/equipe executam E2E/Compose e revisam integração para o gate de saída.
