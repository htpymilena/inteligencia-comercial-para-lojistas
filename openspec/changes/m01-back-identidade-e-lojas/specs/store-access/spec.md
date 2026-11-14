# Spec Delta

## Purpose

Permitir seleção e consulta de lojas autorizadas, impedindo acesso cruzado entre lojistas e mantendo acesso administrativo explícito.

## ADDED Requirements

### Requirement: Listagem autorizada
GET `/api/v1/stores`, operationId `listarLojas`, SHALL exigir autenticação e retornar 200 StoresResponse. ADMIN SHALL listar todas as lojas e LOJISTA somente as vinculadas ao usuário persistido.

#### Scenario: Lojista com vínculo
- **WHEN** LOJISTA vinculado somente à Loja Moda consulta a listagem
- **THEN** items contém somente essa loja e nenhuma propriedade extra

#### Scenario: Nenhum vínculo
- **WHEN** LOJISTA sem vínculos consulta a listagem
- **THEN** recebe 200 com items vazio sem lojas fabricadas

#### Scenario: Administrador
- **WHEN** ADMIN ativo consulta a listagem
- **THEN** recebe todas as lojas existentes mesmo sem vínculo explícito

### Requirement: Detalhe com isolamento
GET `/api/v1/stores/{store_id}`, operationId `obterLoja`, SHALL validar autenticação e autorização no servidor antes de consultar dados da loja, retornando Store conforme contrato.

#### Scenario: Loja autorizada
- **WHEN** ADMIN ou LOJISTA vinculado consulta uma loja existente
- **THEN** recebe 200 com id, name, segment, description e is_demo

#### Scenario: Loja de terceiro
- **WHEN** LOJISTA consulta UUID de loja não vinculada
- **THEN** recebe 403 ApiError sem dados da loja, independentemente da existência do UUID

#### Scenario: Loja inexistente para administrador
- **WHEN** ADMIN consulta UUID válido inexistente
- **THEN** recebe 404 ApiError

#### Scenario: Identificador inválido
- **WHEN** usuário autenticado consulta identificador que não é UUID
- **THEN** recebe 422 ApiError saneado

#### Scenario: Ausência de autenticação
- **WHEN** cliente sem token válido solicita listagem ou detalhe
- **THEN** recebe 401 ApiError sem dados de lojas
