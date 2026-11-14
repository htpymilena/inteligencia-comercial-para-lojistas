# Spec Delta

## Purpose

Verificar segurança, limites, migrations, restauração de teste e reprodução da entrega do BACK sem ampliar contrato. A capacidade define resultados observáveis, preservando o contrato HTTP e o isolamento entre lojas.

## ADDED Requirements

### Requirement: Isolamento em regressão
O sistema SHALL assegurar: recebe 403, ou 404 para recurso externo dentro de loja permitida, sem vazamento.

#### Scenario: Isolamento em regressão
- **WHEN** lojista tenta todas as rotas de lojas externas
- **THEN** recebe 403, ou 404 para recurso externo dentro de loja permitida, sem vazamento

### Requirement: Sem segredos
O sistema SHALL assegurar: ApiError/logs não expõem senha, JWT, SQL ou credenciais.

#### Scenario: Sem segredos
- **WHEN** falhas de validação, SQL e token são exercitadas
- **THEN** ApiError/logs não expõem senha, JWT, SQL ou credenciais

### Requirement: Reprodução
O sistema SHALL assegurar: schema final e contagens são consistentes sem create_all ou duplicações.

#### Scenario: Reprodução
- **WHEN** banco de teste novo recebe cadeia de migrations e seed dupla
- **THEN** schema final e contagens são consistentes sem create_all ou duplicações

### Requirement: Backup de teste
O sistema SHALL assegurar: contagens e consultas conhecidas coincidem sem modificar a origem.

#### Scenario: Backup de teste
- **WHEN** dump sintético é restaurado em destino novo autorizado
- **THEN** contagens e consultas conhecidas coincidem sem modificar a origem

### Requirement: Limites e demo
O sistema SHALL assegurar: limites contratuais são respeitados, DEMO e avisos permanecem, sem mídia pessoal.

#### Scenario: Limites e demo
- **WHEN** consultas de borda e respostas são inspecionadas
- **THEN** limites contratuais são respeitados, DEMO e avisos permanecem, sem mídia pessoal

### Requirement: Evidência de entrega
O sistema SHALL assegurar: relatório registra a pendência e não declara G08 INTEGRADO.

#### Scenario: Evidência de entrega
- **WHEN** checagens BACK passaram mas E2E ou revisão de equipe falta
- **THEN** relatório registra a pendência e não declara G08 INTEGRADO

### Requirement: Contrato e autorização preservados
As operações do módulo SHALL respeitar sistema/openapi.yaml, sem campos extras ou operações futuras. Rotas protegidas SHALL validar token e acesso à loja antes de consultar dados; erros SHALL seguir ApiError com request_id saneado.

#### Scenario: Acesso não autorizado
- **WHEN** cliente usa token ausente/inválido ou solicita loja não autorizada
- **THEN** recebe respectivamente 401 ou 403, sem conteúdo de outra loja
