# Spec Delta

## Purpose

Persistir e consultar métricas DEMO diárias por loja, agregar KPIs e comparar o período anterior equivalente. A capacidade define resultados observáveis, preservando o contrato HTTP e o isolamento entre lojas.

## ADDED Requirements

### Requirement: Agregação correta
O sistema SHALL somar as métricas persistidas no período e calcular conversão sobre os totais de vendas e visitantes, arredondando a taxa de resposta para duas casas, sem fazer média das taxas diárias.

#### Scenario: Agregação correta
- **WHEN** período contém dias com 100/10 e 200/10 visitantes/vendas
- **THEN** retorna 300 visitantes, 20 vendas e conversão 6.67, nunca média diária

### Requirement: Decimal e zero
O sistema SHALL calcular receitas em Decimal e retorná-las como strings com duas casas; a conversão SHALL ser null quando o total de visitantes for zero.

#### Scenario: Decimal e zero
- **WHEN** receitas são 0.10 e 0.20 e outra janela tem zero visitantes
- **THEN** receita soma 0.30 e conversão da janela zero é null

### Requirement: Período validado
O sistema SHALL aceitar datas inclusivas ordenadas com até 366 dias e rejeitar datas inválidas, invertidas ou intervalos maiores com 422 ApiError.

#### Scenario: Período validado
- **WHEN** datas estão invertidas, inválidas ou excedem 366 dias inclusivos
- **THEN** retorna 422 ApiError; 366 dias válidos são aceitos

### Requirement: Baseline equivalente
O sistema SHALL comparar o período consultado de N dias inclusivos com os N dias imediatamente anteriores; variação percentual SHALL ser null quando o total anterior for zero.

#### Scenario: Baseline equivalente
- **WHEN** consulta cobre 2026-11-10 a 2026-11-12
- **THEN** baseline corresponde a 2026-11-07 a 2026-11-09 e base zero retorna variação null

### Requirement: Sem registros
O sistema SHALL retornar série vazia e totais zero com conversão null quando não existirem registros no período, sem inventar métricas.

#### Scenario: Sem registros
- **WHEN** janela autorizada não tem métricas
- **THEN** retorna items vazio e totais zero com conversão null, sem registros fabricados

### Requirement: Seed repetível
O sistema SHALL semear 60 dias por loja de forma determinística para uma data-base fixa; reexecução SHALL preservar IDs, contagens e registros externos sem duplicação.

#### Scenario: Seed repetível
- **WHEN** seed é executada duas vezes com a mesma data-base
- **THEN** preserva 60 dias por loja, IDs e registros externos

### Requirement: Receitas válidas antes da escrita
Conforme RN010, o sistema SHALL rejeitar antes da persistência receitas negativas, não finitas ou sem representação exata em centavos. SHALL usar Decimal, sem arredondar frações inválidas para torná-las aceitáveis.

#### Scenario: Receita negativa
- **WHEN** uma entrada da seed contém receita -0.01
- **THEN** a validação falha antes da escrita, sem persistir a receita nem deixar alterações parciais

#### Scenario: Fração inválida
- **WHEN** uma entrada da seed contém receita 1.234
- **THEN** a validação rejeita a entrada antes da escrita, sem convertê-la silenciosamente para 1.23

#### Scenario: Receita válida
- **WHEN** receitas 0.00 e 1.23 são fornecidas
- **THEN** são aceitas e retornadas como strings com duas casas

#### Scenario: Valor não finito
- **WHEN** a entrada contém NaN ou Infinity
- **THEN** é rejeitada antes da persistência com diagnóstico saneado

### Requirement: Interações independentes dos visitantes
Conforme RN011, o sistema SHALL tratar interações como eventos, permitindo interaction_count maior que visitor_count. As duas contagens SHALL ser inteiras não negativas, sem limite de interações determinado pelos visitantes.

#### Scenario: Mais interações que visitantes
- **WHEN** um registro válido contém 100 visitantes e 150 interações
- **THEN** as contagens são aceitas e preservadas na série e nos totais

#### Scenario: Interações sem visitantes
- **WHEN** um registro válido contém zero visitantes e interações positivas
- **THEN** as interações são preservadas e a conversão permanece null

### Requirement: Contrato e autorização preservados
As operações do módulo SHALL respeitar sistema/openapi.yaml, sem campos extras ou operações futuras. Rotas protegidas SHALL validar token e acesso à loja antes de consultar dados; erros SHALL seguir ApiError com request_id saneado.

#### Scenario: Acesso não autorizado
- **WHEN** cliente usa token ausente/inválido ou solicita loja não autorizada
- **THEN** recebe respectivamente 401 ou 403, sem conteúdo de outra loja
