# Tasks

Planejamento apenas; aprovação pendente. G00 não concluído. Implementação bloqueada até aprovação deste plano e cumprimento de M01; G01 INTEGRADO. Cenários abaixo preparados como documentação, não testes implementados/executados.

## 1. Pré-condições

- [ ] 1.1 Conferir aprovação explícita e evidências dos gates anteriores, base integrada e branch feat/m02-back-store-metrics; verificar Git e registrar resultado sem alterar main.
- [ ] 1.2 Reconciliar componentes futuros deste design com implementações dependentes integradas; verificar contrato e registrar somente ajustes de caminhos sem mudar comportamento, encaminhando divergências materiais à revisão.

## 2. Persistência e domínio

- [ ] 2.1 Implementar a persistência prevista (daily_metrics) sem create_all ou alterações destrutivas; verificar schema/constraints e cadeia Alembic em PostgreSQL 16 exclusivo quando aplicável e documentar os comandos.
- [ ] 2.2 Implementar e testar agregação correta: quando período contém dias com 100/10 e 200/10 visitantes/vendas, comprovar que retorna 300 visitantes, 20 vendas e conversão 6.67, nunca média diária; documentar comportamento e fixture no relatório BACK.
- [ ] 2.3 Implementar e testar decimal e zero: quando receitas são 0.10 e 0.20 e outra janela tem zero visitantes, comprovar que receita soma 0.30 e conversão da janela zero é null; documentar comportamento e fixture no relatório BACK.
- [ ] 2.4 Implementar e testar período validado: quando datas estão invertidas, inválidas ou excedem 366 dias inclusivos, comprovar que retorna 422 ApiError; 366 dias válidos são aceitos; documentar comportamento e fixture no relatório BACK.
- [ ] 2.5 Implementar e testar baseline equivalente: quando consulta cobre 2026-11-10 a 2026-11-12, comprovar que baseline corresponde a 2026-11-07 a 2026-11-09 e base zero retorna variação null; documentar comportamento e fixture no relatório BACK.
- [ ] 2.6 Implementar e testar sem registros: quando janela autorizada não tem métricas, comprovar que retorna items vazio e totais zero com conversão null, sem registros fabricados; documentar comportamento e fixture no relatório BACK.
- [ ] 2.7 Implementar e testar seed repetível: quando seed é executada duas vezes com a mesma data-base, comprovar que preserva 60 dias por loja, IDs e registros externos; documentar comportamento e fixture no relatório BACK.

## 3. HTTP e integração BACK

- [ ] 3.1 Implementar/adaptar somente operações previstas (obterDashboard, listarMetricasDiarias), com autorização M01 e ApiError; testar HTTP real contra PostgreSQL e registrar casos de sucesso/erro sem SQL ou credenciais em logs.
- [ ] 3.2 Verificar seed idempotente e preservação de dados externos quando houver seed; se não houver, executar regressão das seeds anteriores; documentar data-base e contagens sem segredos.
- [ ] 3.3 Comparar runtime/respostas reais ao subconjunto normativo implementado: métodos, paths, operationIds, security, required, enums, query/body e status; executar lint OpenAPI sem alterar sistema/openapi.yaml e registrar resultado.

## 4. Regressão e evidências

- [ ] 4.1 Executar pela .venv Python 3.12 pytest tests/unit tests/contract e pytest tests/integration em PostgreSQL 16 exclusivo, ruff check --no-cache ., mypy e pip check; corrigir falhas e registrar resultados/skips reais em backend/EVIDENCIAS-M02.md.
- [ ] 4.2 Executar smoke das operações do módulo e regressão dos anteriores, revisar diff por segredos e escopo e entregar resumo BACK com riscos/pendências; verificar README backend reproduzível sem declarar G02 integrado.

## Workflow follow-up

- Commit e push exigem autorização separada, conferência da branch e checks reais; este planejamento não os executa.
- Revisão/merge pertence à equipe. FRONT/E2E/Compose/CI são dependências externas, sem alterações pelo BACK nesta solicitação.
- Somente após G02 integrado seguir a implementação seguinte; aprovação de artefatos não equivale a aprovação do gate.
