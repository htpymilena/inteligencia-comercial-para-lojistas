# Spec Delta

## Purpose

Comparar períodos inclusivos equivalentes usando as métricas persistidas e as fórmulas já compartilhadas. A capacidade define resultados observáveis, preservando o contrato HTTP e o isolamento entre lojas.

## ADDED Requirements

### Requirement: Janela equivalente
O sistema SHALL assegurar: baseline_start/end são 2026-11-07..2026-11-09.

#### Scenario: Janela equivalente
- **WHEN** consulta 2026-11-10..2026-11-12
- **THEN** baseline_start/end são 2026-11-07..2026-11-09

### Requirement: Cálculo compartilhado
O sistema SHALL assegurar: totais e taxas coincidem; conversão 20/300 retorna 6.67.

#### Scenario: Cálculo compartilhado
- **WHEN** as mesmas métricas são consultadas por dashboard, experimento e relatório
- **THEN** totais e taxas coincidem; conversão 20/300 retorna 6.67

### Requirement: Zero observado
O sistema SHALL assegurar: available=true e percentuais sem denominador são null, nunca NaN ou Infinity.

#### Scenario: Zero observado
- **WHEN** duas janelas completas contêm contagens zero
- **THEN** available=true e percentuais sem denominador são null, nunca NaN ou Infinity

### Requirement: Cobertura parcial
O sistema SHALL assegurar: available=false com motivo, baseline/current/changes null e aviso.

#### Scenario: Cobertura parcial
- **WHEN** falta qualquer dia de uma janela
- **THEN** available=false com motivo, baseline/current/changes null e aviso

### Requirement: Conversão em pontos
O sistema SHALL assegurar: conversion_change_pp é 5 e não 50.

#### Scenario: Conversão em pontos
- **WHEN** taxa passa de 10 a 15 por cento
- **THEN** conversion_change_pp é 5 e não 50

### Requirement: Período inválido
O sistema SHALL assegurar: retorna 422 ApiError; intervalo de 366 é aceito.

#### Scenario: Período inválido
- **WHEN** datas invertidas ou intervalo de 367 dias é solicitado
- **THEN** retorna 422 ApiError; intervalo de 366 é aceito

### Requirement: Contrato e autorização preservados
As operações do módulo SHALL respeitar sistema/openapi.yaml, sem campos extras ou operações futuras. Rotas protegidas SHALL validar token e acesso à loja antes de consultar dados; erros SHALL seguir ApiError com request_id saneado.

#### Scenario: Acesso não autorizado
- **WHEN** cliente usa token ausente/inválido ou solicita loja não autorizada
- **THEN** recebe respectivamente 401 ou 403, sem conteúdo de outra loja
