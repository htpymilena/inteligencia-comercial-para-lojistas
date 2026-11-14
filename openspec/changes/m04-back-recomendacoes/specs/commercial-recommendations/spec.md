# Spec Delta

## Purpose

Listar recomendações explicáveis DEMO e aceitar/descartar com persistência e controle de concorrência. A capacidade define resultados observáveis, preservando o contrato HTTP e o isolamento entre lojas.

## ADDED Requirements

### Requirement: Lista explicável
O sistema SHALL assegurar: recebe título, hipótese, evidência, prioridade, status e origem RULE_BASED_DEMO/DEMO; filtro inválido gera 422.

#### Scenario: Lista explicável
- **WHEN** loja consulta recomendações com filtro opcional
- **THEN** recebe título, hipótese, evidência, prioridade, status e origem RULE_BASED_DEMO/DEMO; filtro inválido gera 422

### Requirement: Aceite ou descarte
O sistema SHALL assegurar: retorna 200 e novo estado persiste em sessão posterior.

#### Scenario: Aceite ou descarte
- **WHEN** recomendação PROPOSED recebe status permitido
- **THEN** retorna 200 e novo estado persiste em sessão posterior

### Requirement: Terminal imutável
O sistema SHALL assegurar: retorna 409 sem alterar registro.

#### Scenario: Terminal imutável
- **WHEN** PATCH repete estado terminal ou tenta trocá-lo
- **THEN** retorna 409 sem alterar registro

### Requirement: Concorrência
O sistema SHALL assegurar: uma vence e a outra recebe 409.

#### Scenario: Concorrência
- **WHEN** duas requisições simultâneas tentam encerrar a mesma proposta
- **THEN** uma vence e a outra recebe 409

### Requirement: ID externo
O sistema SHALL assegurar: recebe 404 sem revelar dados externos.

#### Scenario: ID externo
- **WHEN** cliente autorizado na loja usa recommendation_id de outra loja
- **THEN** recebe 404 sem revelar dados externos

### Requirement: Seed preserva decisão
O sistema SHALL assegurar: não duplica recomendações nem reabre estado terminal.

#### Scenario: Seed preserva decisão
- **WHEN** seed é repetida após aceite
- **THEN** não duplica recomendações nem reabre estado terminal

### Requirement: Contrato e autorização preservados
As operações do módulo SHALL respeitar sistema/openapi.yaml, sem campos extras ou operações futuras. Rotas protegidas SHALL validar token e acesso à loja antes de consultar dados; erros SHALL seguir ApiError com request_id saneado.

#### Scenario: Acesso não autorizado
- **WHEN** cliente usa token ausente/inválido ou solicita loja não autorizada
- **THEN** recebe respectivamente 401 ou 403, sem conteúdo de outra loja
