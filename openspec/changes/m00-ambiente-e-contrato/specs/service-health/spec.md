# Spec Delta

## Purpose

Oferecer um diagnóstico público e contratual da disponibilidade HTTP da API, utilizável pela equipe e pela interface sem autenticação ou dados de negócio.

## ADDED Requirements

### Requirement: Saúde pública conforme contrato
A API SHALL expor `GET /health` sem autenticação com `operationId: verificarSaude`. Em sucesso SHALL retornar HTTP 200 JSON conforme `HealthResponse` de `sistema/openapi.yaml`, contendo apenas `status` e `service`, com `status: ok` e `service` string.

#### Scenario: Consulta sem token
- **WHEN** um cliente envia `GET /health` sem cabeçalho de autorização
- **THEN** recebe HTTP 200 e JSON válido com `status: ok` e `service: nexo-api`
- **AND** não recebe campos adicionais nem dados sensíveis

### Requirement: Escopo do diagnóstico
O resultado de `/health` SHALL indicar disponibilidade HTTP, sem afirmar prontidão do banco ou de módulos de negócio. A verificação de conexão com o banco SHALL possuir evidência de integração independente.

#### Scenario: Interpretação do resultado
- **WHEN** uma consulta de saúde HTTP é bem-sucedida
- **THEN** o resultado comprova somente a disponibilidade HTTP da API
- **AND** a aprovação do ambiente ainda depende de healthcheck e teste de conexão do banco

### Requirement: Erro contratual sem vazamento
Uma falha interna tratada em `/health` SHALL retornar HTTP 500 conforme `ApiError` referenciado pelo contrato, sem stack trace, SQL ou segredos na resposta.

#### Scenario: Falha interna controlada
- **GIVEN** falha interna induzida em teste isolado
- **WHEN** um cliente consulta `/health`
- **THEN** recebe HTTP 500 e corpo aderente a `ApiError`
- **AND** a resposta não expõe detalhes internos ou credenciais
