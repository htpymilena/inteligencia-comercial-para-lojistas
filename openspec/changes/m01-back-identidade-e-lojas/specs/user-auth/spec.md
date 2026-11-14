# Spec Delta

## Purpose

Autenticar identidades cadastradas e proteger o acesso à API sem expor credenciais, preservando o contrato HTTP do NEXO 2031.

## ADDED Requirements

### Requirement: Login público contratual
O sistema SHALL oferecer POST `/api/v1/auth/login`, operationId `login`, público, conforme LoginRequest e LoginResponse do contrato normativo, autenticando somente contas ativas com credenciais corretas.

#### Scenario: Credenciais válidas
- **WHEN** conta ativa envia email e senha corretos
- **THEN** recebe 200 com access_token, token_type bearer e User sem campos extras ou password_hash

#### Scenario: Credenciais recusadas
- **WHEN** email inexiste, senha está incorreta ou conta está inativa
- **THEN** recebe 401 ApiError com mensagem genérica, sem revelar qual condição falhou

#### Scenario: Corpo inválido
- **WHEN** login recebe email inválido, senha vazia, campos extras ou corpo incompleto
- **THEN** recebe 422 ApiError sem repetir senha ou corpo recebido

### Requirement: JWT e perfil autenticado
O sistema SHALL emitir JWT assinado com sub, role e exp, validade de 30 minutos, e exigir token válido em GET `/api/v1/auth/me`, operationId `obterPerfil`. O perfil SHALL corresponder ao usuário ativo persistido.

#### Scenario: Perfil válido
- **WHEN** token válido de usuário ativo é enviado ao perfil
- **THEN** recebe 200 User com id, email, display_name e role conforme contrato

#### Scenario: Token recusado
- **WHEN** token está ausente, malformado, expirado, sem claims obrigatórias ou com assinatura inválida
- **THEN** recebe 401 ApiError sem acesso ao perfil

#### Scenario: Conta desativada após login
- **WHEN** token identifica conta removida ou desativada após sua emissão
- **THEN** recebe 401 ApiError mesmo antes de expirar

### Requirement: Diagnóstico sem segredos
O sistema SHALL responder falhas internas com 500 ApiError e correlacionar erros com request_id sem expor JWT, senha, SQL ou stack trace em respostas e logs da aplicação.

#### Scenario: Falha controlada de autenticação
- **WHEN** erro interno contendo credenciais é provocado em teste
- **THEN** retorna 500 saneado com request_id e nenhum segredo aparece nos logs ou no corpo
