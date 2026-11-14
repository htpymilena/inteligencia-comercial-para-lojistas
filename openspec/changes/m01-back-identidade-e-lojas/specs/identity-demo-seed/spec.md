# Spec Delta

## Purpose

Disponibilizar identidades e lojas fictícias persistidas para demonstração reproduzível, preservando credenciais e registros externos.

## ADDED Requirements

### Requirement: Provisionamento explícito de identidade demo
A seed SHALL ser executada explicitamente após migrations e criar três lojas fictícias, uma conta ADMIN e uma LOJISTA. O LOJISTA SHALL ter vínculo somente com Loja Moda; Loja Calçados e Loja Acessórios SHALL permanecer inacessíveis a ele.

#### Scenario: Primeira execução
- **WHEN** operador executa a seed em banco de teste preparado com senhas fornecidas por ambiente
- **THEN** as três lojas e duas contas existem e permitem autenticação e isolamento conforme seus papéis

#### Scenario: Inicialização normal
- **WHEN** API inicia sem execução explícita de seed
- **THEN** nenhuma identidade ou loja é criada automaticamente

### Requirement: Repetição segura
A seed SHALL usar identidades estáveis, executar em transação e preservar registros externos; reexecução SHALL manter contagens e vínculos sem duplicação ou redefinição silenciosa de senha.

#### Scenario: Segunda execução
- **WHEN** a seed é executada novamente após a primeira execução bem-sucedida
- **THEN** IDs, contagens, credenciais persistidas e vínculos permanecem estáveis

#### Scenario: Colisão com registro externo
- **WHEN** identidade reservada conflita com registro externo preexistente
- **THEN** a seed falha com diagnóstico saneado, sem sobrescrever o registro ou deixar alterações parciais

### Requirement: Credenciais protegidas
Senhas demo SHALL vir exclusivamente de variáveis de ambiente e ser persistidas somente como hash seguro. Ausência de senhas SHALL interromper a seed antes de escrever dados e sem revelar valores em logs.

#### Scenario: Senha ausente
- **WHEN** uma das senhas obrigatórias não está configurada
- **THEN** a seed falha sem alterar o banco e informa somente o nome da configuração ausente

#### Scenario: Persistência inspecionada
- **WHEN** registros e logs de uma execução bem-sucedida são inspecionados
- **THEN** nenhuma senha em texto puro aparece e o hash permite verificar a credencial configurada
