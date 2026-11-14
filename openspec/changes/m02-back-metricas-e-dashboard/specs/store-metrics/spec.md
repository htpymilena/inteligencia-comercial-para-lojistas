# Spec Delta

## Purpose

Persistir e consultar métricas DEMO diárias por loja, agregar KPIs e comparar o período anterior equivalente. A capacidade define resultados observáveis, preservando o contrato HTTP e o isolamento entre lojas.

## ADDED Requirements

### Requirement: Agregação correta
O sistema SHALL assegurar: retorna 300 visitantes, 20 vendas e conversão 6.67, nunca média diária.

#### Scenario: Agregação correta
- **WHEN** período contém dias com 100/10 e 200/10 visitantes/vendas
- **THEN** retorna 300 visitantes, 20 vendas e conversão 6.67, nunca média diária

### Requirement: Decimal e zero
O sistema SHALL assegurar: receita soma 0.30 e conversão da janela zero é null.

#### Scenario: Decimal e zero
- **WHEN** receitas são 0.10 e 0.20 e outra janela tem zero visitantes
- **THEN** receita soma 0.30 e conversão da janela zero é null

### Requirement: Período validado
O sistema SHALL assegurar: retorna 422 ApiError; 366 dias válidos são aceitos.

#### Scenario: Período validado
- **WHEN** datas estão invertidas, inválidas ou excedem 366 dias inclusivos
- **THEN** retorna 422 ApiError; 366 dias válidos são aceitos

### Requirement: Baseline equivalente
O sistema SHALL assegurar: baseline corresponde a 2026-11-07 a 2026-11-09 e base zero retorna variação null.

#### Scenario: Baseline equivalente
- **WHEN** consulta cobre 2026-11-10 a 2026-11-12
- **THEN** baseline corresponde a 2026-11-07 a 2026-11-09 e base zero retorna variação null

### Requirement: Sem registros
O sistema SHALL assegurar: retorna items vazio e totais zero com conversão null, sem registros fabricados.

#### Scenario: Sem registros
- **WHEN** janela autorizada não tem métricas
- **THEN** retorna items vazio e totais zero com conversão null, sem registros fabricados

### Requirement: Seed repetível
O sistema SHALL assegurar: preserva 60 dias por loja, IDs e registros externos.

#### Scenario: Seed repetível
- **WHEN** seed é executada duas vezes com a mesma data-base
- **THEN** preserva 60 dias por loja, IDs e registros externos

### Requirement: Contrato e autorização preservados
As operações do módulo SHALL respeitar sistema/openapi.yaml, sem campos extras ou operações futuras. Rotas protegidas SHALL validar token e acesso à loja antes de consultar dados; erros SHALL seguir ApiError com request_id saneado.

#### Scenario: Acesso não autorizado
- **WHEN** cliente usa token ausente/inválido ou solicita loja não autorizada
- **THEN** recebe respectivamente 401 ou 403, sem conteúdo de outra loja
