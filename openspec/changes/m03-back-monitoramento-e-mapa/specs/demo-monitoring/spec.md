# Spec Delta

## Purpose

Consultar câmeras fictícias, snapshot agregado, zonas e grade diária sintética sem mídia real. A capacidade define resultados observáveis, preservando o contrato HTTP e o isolamento entre lojas.

## ADDED Requirements

### Requirement: Demo explícita
O sistema SHALL assegurar: recebe somente dados sintéticos com is_simulated=true e origem DEMO, sem URL de vídeo.

#### Scenario: Demo explícita
- **WHEN** cliente consulta câmera e snapshot existentes
- **THEN** recebe somente dados sintéticos com is_simulated=true e origem DEMO, sem URL de vídeo

### Requirement: Grade completa
O sistema SHALL assegurar: recebe 80 coordenadas únicas com intensidade entre 0 e 1 e grade 10x8.

#### Scenario: Grade completa
- **WHEN** consulta data incluída na seed
- **THEN** recebe 80 coordenadas únicas com intensidade entre 0 e 1 e grade 10x8

### Requirement: Dia sem dados
O sistema SHALL assegurar: recebe 200 cells=[] e insights=[] sem fallback.

#### Scenario: Dia sem dados
- **WHEN** consulta data não semeada
- **THEN** recebe 200 cells=[] e insights=[] sem fallback

### Requirement: Snapshot ausente
O sistema SHALL assegurar: recebe 404 ApiError.

#### Scenario: Snapshot ausente
- **WHEN** loja autorizada não tem snapshot
- **THEN** recebe 404 ApiError

### Requirement: Limites espaciais
O sistema SHALL assegurar: validação rejeita dado e nenhuma resposta inválida é persistida.

#### Scenario: Limites espaciais
- **WHEN** seed ou fixture tenta coordenada fora da grade ou zona transbordando
- **THEN** validação rejeita dado e nenhuma resposta inválida é persistida

### Requirement: Reexecução
O sistema SHALL assegurar: mantém IDs e contagens, sem sobrescrever registros externos.

#### Scenario: Reexecução
- **WHEN** seed roda duas vezes com data-base fixa
- **THEN** mantém IDs e contagens, sem sobrescrever registros externos

### Requirement: Contrato e autorização preservados
As operações do módulo SHALL respeitar sistema/openapi.yaml, sem campos extras ou operações futuras. Rotas protegidas SHALL validar token e acesso à loja antes de consultar dados; erros SHALL seguir ApiError com request_id saneado.

#### Scenario: Acesso não autorizado
- **WHEN** cliente usa token ausente/inválido ou solicita loja não autorizada
- **THEN** recebe respectivamente 401 ou 403, sem conteúdo de outra loja
