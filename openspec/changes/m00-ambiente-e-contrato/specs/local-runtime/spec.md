# Spec Delta

## Purpose

Permitir que a equipe execute um ambiente local reproduzível com interface, API e banco isolados, preservando configuração e dados de desenvolvimento.

## ADDED Requirements

### Requirement: Inicialização conjunta documentada
O ambiente SHALL iniciar os serviços `db`, `backend` e `frontend` pelo comando documentado `docker compose up --build -d`, com interface em `http://localhost:5173` e API em `http://localhost:8000`.

#### Scenario: Primeira execução com configuração válida
- **GIVEN** Docker com Compose disponível e variáveis locais preenchidas conforme o exemplo
- **WHEN** a equipe executa os comandos do README na raiz do repositório
- **THEN** os três serviços iniciam e a interface consegue consultar a API
- **AND** o backend aguarda o banco ficar saudável antes de iniciar

### Requirement: Configuração sem exposição de segredos
O ambiente SHALL fornecer exemplo de configuração sem credenciais reais, excluir `.env` do versionamento e impedir inicialização com variáveis obrigatórias ausentes. Segredos SHALL permanecer fora do bundle público e dos logs.

#### Scenario: Variável obrigatória ausente
- **WHEN** a equipe inicia o ambiente sem uma variável obrigatória definida no exemplo
- **THEN** recebe diagnóstico identificando a variável ausente sem revelar valores secretos
- **AND** a configuração incompleta não é apresentada como ambiente funcional

#### Scenario: Inspeção dos artefatos públicos
- **WHEN** a equipe inspeciona arquivos versionáveis, bundle frontend e logs
- **THEN** não encontra senhas locais, chaves JWT ou URL de banco com credenciais reais

### Requirement: Persistência e isolamento local
O ambiente SHALL preservar dados do banco em volume nomeado entre reinicializações normais e SHALL manter o banco sem porta publicada no host por padrão. As portas HTTP locais SHALL aceitar conexões apenas no loopback por padrão.

#### Scenario: Reinicialização preserva dados
- **GIVEN** um registro técnico em banco isolado de teste
- **WHEN** a equipe para e recria contêineres sem remover volumes
- **THEN** o registro permanece disponível no mesmo volume
- **AND** nenhum procedimento padrão remove dados automaticamente

#### Scenario: Portas padrão
- **WHEN** a equipe examina os serviços iniciados com a configuração padrão
- **THEN** apenas as portas HTTP 5173 e 8000 estão publicadas em loopback
- **AND** o banco permanece acessível pela rede interna dos serviços
