# Proposal

## Why

Criar experimentos a partir de recomendação aceita, controlar seu ciclo e comparar janelas completas. O módulo atende RF009–010, RN019–023, RN028–029 e prepara a próxima fatia integrada sem antecipar implementação.

## What Changes

- Planejar exclusivamente o BACK M05: Experimentos e resultados.
- Operações: listarExperimentos, criarExperimento, obterExperimento, alterarStatusExperimento, obterResultadoExperimento.
- Persistência: experiments. Testes e documentação próprios acompanham cada entrega.
- Dependências: M04 e métricas M02; G04 INTEGRADO. Planejamento independente não dispensa integração.

## Capabilities

### New Capabilities

- `commercial-experiments`: Criar experimentos a partir de recomendação aceita, controlar seu ciclo e comparar janelas completas.

### Modified Capabilities

Nenhuma. Inventário principal OpenSpec vazio nesta inspeção; as mudanças anteriores permanecem separadas.

## Impact

Implementação futura restrita a backend/** (exceto Dockerfile e infraestrutura compartilhada), reutilizando FastAPI/Pydantic, SQLAlchemy/Alembic e Python 3.12. Não modificar FRONT, Compose, CI, contrato ou M07.

Esta proposta aguarda aprovação humana. G00 permanece PENDENTE nos registros consultados. Antes de apply, exigir aprovação deste plano e gates anteriores integrados conforme sistema/06 e sistema/10; a liberação de desenvolvimento independente depende de decisão explícita da equipe, não desta proposta. Gate de saída G05 exige integração FRONT/equipe além dos checks BACK.
