# Spec Delta

## Purpose

Disponibilizar uma estrutura desktop navegável e uma página técnica que permita verificar a comunicação real entre o navegador e a API local.

## ADDED Requirements

### Requirement: Shell acessível sem funcionalidades fictícias
A interface SHALL carregar uma estrutura desktop com identificação do NEXO 2031 e acesso à página técnica de conexão. Navegação disponível SHALL ser utilizável por teclado; módulos não implementados SHALL ser omitidos ou explicitamente indisponíveis.

#### Scenario: Acesso inicial
- **WHEN** o usuário abre `http://localhost:5173`
- **THEN** encontra o shell e a página técnica sem exigência de login
- **AND** consegue acessar as ações disponíveis pelo teclado
- **AND** não encontra indicadores, câmeras ou funcionalidades de negócio apresentados como implementados

### Requirement: Consulta de saúde pelo mesmo domínio
A página técnica SHALL consultar o endpoint real `/health` pelo domínio do frontend usando proxy. O cliente SHALL respeitar o caminho raiz de saúde independentemente da base `/api/v1` das operações de negócio.

#### Scenario: Conexão real bem-sucedida
- **WHEN** a página consulta saúde com backend disponível
- **THEN** o navegador solicita `/health` no domínio do frontend e recebe resposta da API
- **AND** a página apresenta disponibilidade HTTP e identificação do serviço
- **AND** não faz requisição a `/api/v1/health` nem usa resposta simulada como sucesso

### Requirement: Estados de consulta e recuperação
A página SHALL informar carregamento, sucesso e falha de conexão ou resposta inválida, oferecendo nova tentativa após falha. Uma resposta vazia ou fora do contrato SHALL ser tratada como falha, sem fallback silencioso para fixtures.

#### Scenario: Consulta pendente
- **WHEN** a consulta ainda aguarda resposta
- **THEN** a interface informa carregamento sem afirmar conexão bem-sucedida

#### Scenario: API indisponível
- **WHEN** a consulta falha por rede, timeout ou HTTP não bem-sucedido
- **THEN** a interface informa falha de conexão e oferece tentar novamente
- **AND** não apresenta estado saudável fabricado

#### Scenario: Resposta inválida
- **WHEN** a consulta recebe corpo vazio ou incompatível com `HealthResponse`
- **THEN** a interface apresenta erro de resposta inválida sem exibir sucesso

#### Scenario: Recuperação por nova tentativa
- **GIVEN** uma tentativa anterior falhou e a API voltou a responder
- **WHEN** o usuário aciona tentar novamente
- **THEN** uma nova consulta real ocorre e atualiza a interface para sucesso
