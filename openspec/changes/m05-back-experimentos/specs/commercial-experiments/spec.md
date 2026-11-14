# Spec Delta

## Purpose

Criar experimentos a partir de recomendação aceita, controlar seu ciclo e comparar janelas completas. A capacidade define resultados observáveis, preservando o contrato HTTP e o isolamento entre lojas.

## ADDED Requirements

### Requirement: Criação válida
O sistema SHALL assegurar: recebe 201 DRAFT persistido.

#### Scenario: Criação válida
- **WHEN** cliente usa recomendação ACCEPTED da mesma loja e corpo válido
- **THEN** recebe 201 DRAFT persistido

### Requirement: Referência recusada
O sistema SHALL assegurar: recebe respectivamente 404 ou 409 sem expor dados externos.

#### Scenario: Referência recusada
- **WHEN** recomendação é externa/inexistente ou local não aceita
- **THEN** recebe respectivamente 404 ou 409 sem expor dados externos

### Requirement: Transições
O sistema SHALL assegurar: recebe 409; somente as transições documentadas são permitidas.

#### Scenario: Transições
- **WHEN** DRAFT tenta concluir diretamente ou estado terminal recebe PATCH
- **THEN** recebe 409; somente as transições documentadas são permitidas

### Requirement: Corrida
O sistema SHALL assegurar: somente uma transição vence e o conflito retorna 409.

#### Scenario: Corrida
- **WHEN** duas sessões alteram o mesmo estado inicial
- **THEN** somente uma transição vence e o conflito retorna 409

### Requirement: Comparação completa
O sistema SHALL assegurar: retorna available=true com baseline/during/changes e disclaimer observacional.

#### Scenario: Comparação completa
- **WHEN** COMPLETED possui cada dia das duas janelas
- **THEN** retorna available=true com baseline/during/changes e disclaimer observacional

### Requirement: Resultado indisponível
O sistema SHALL assegurar: retorna 200 available=false, motivo e três blocos numéricos null.

#### Scenario: Resultado indisponível
- **WHEN** estado não é COMPLETED ou falta um dia em qualquer janela
- **THEN** retorna 200 available=false, motivo e três blocos numéricos null

### Requirement: Validação
O sistema SHALL assegurar: retorna 422 ApiError.

#### Scenario: Validação
- **WHEN** título tem menos de 3 ou mais de 140 caracteres, métrica inválida ou datas invertidas
- **THEN** retorna 422 ApiError

### Requirement: Contrato e autorização preservados
As operações do módulo SHALL respeitar sistema/openapi.yaml, sem campos extras ou operações futuras. Rotas protegidas SHALL validar token e acesso à loja antes de consultar dados; erros SHALL seguir ApiError com request_id saneado.

#### Scenario: Acesso não autorizado
- **WHEN** cliente usa token ausente/inválido ou solicita loja não autorizada
- **THEN** recebe respectivamente 401 ou 403, sem conteúdo de outra loja
