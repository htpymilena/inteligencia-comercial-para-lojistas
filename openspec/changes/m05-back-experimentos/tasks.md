# Tasks

Planejamento apenas; aprovação pendente. G00 não concluído. Implementação bloqueada até aprovação deste plano e cumprimento de M04 e métricas M02; G04 INTEGRADO. Cenários abaixo preparados como documentação, não testes implementados/executados.

## 1. Pré-condições

- [ ] 1.1 Conferir aprovação explícita e evidências dos gates anteriores, base integrada e branch feat/m05-back-commercial-experiments; verificar Git e registrar resultado sem alterar main.
- [ ] 1.2 Reconciliar componentes futuros deste design com implementações dependentes integradas; verificar contrato e registrar somente ajustes de caminhos sem mudar comportamento, encaminhando divergências materiais à revisão.

## 2. Persistência e domínio

- [ ] 2.1 Implementar a persistência prevista (experiments) sem create_all ou alterações destrutivas; verificar schema/constraints e cadeia Alembic em PostgreSQL 16 exclusivo quando aplicável e documentar os comandos.
- [ ] 2.2 Implementar e testar criação válida: quando cliente usa recomendação ACCEPTED da mesma loja e corpo válido, comprovar que recebe 201 DRAFT persistido; documentar comportamento e fixture no relatório BACK.
- [ ] 2.3 Implementar e testar referência recusada: quando recomendação é externa/inexistente ou local não aceita, comprovar que recebe respectivamente 404 ou 409 sem expor dados externos; documentar comportamento e fixture no relatório BACK.
- [ ] 2.4 Implementar e testar transições: quando DRAFT tenta concluir diretamente ou estado terminal recebe PATCH, comprovar que recebe 409; somente as transições documentadas são permitidas; documentar comportamento e fixture no relatório BACK.
- [ ] 2.5 Implementar e testar corrida: quando duas sessões alteram o mesmo estado inicial, comprovar que somente uma transição vence e o conflito retorna 409; documentar comportamento e fixture no relatório BACK.
- [ ] 2.6 Implementar e testar comparação completa: quando COMPLETED possui cada dia das duas janelas, comprovar que retorna available=true com baseline/during/changes e disclaimer observacional; documentar comportamento e fixture no relatório BACK.
- [ ] 2.7 Implementar e testar resultado indisponível: quando estado não é COMPLETED ou falta um dia em qualquer janela, comprovar que retorna 200 available=false, motivo e três blocos numéricos null; documentar comportamento e fixture no relatório BACK.
- [ ] 2.8 Implementar e testar validação: quando título tem menos de 3 ou mais de 140 caracteres, métrica inválida ou datas invertidas, comprovar que retorna 422 ApiError; documentar comportamento e fixture no relatório BACK.

## 3. HTTP e integração BACK

- [ ] 3.1 Implementar/adaptar somente operações previstas (listarExperimentos, criarExperimento, obterExperimento, alterarStatusExperimento, obterResultadoExperimento), com autorização M01 e ApiError; testar HTTP real contra PostgreSQL e registrar casos de sucesso/erro sem SQL ou credenciais em logs.
- [ ] 3.2 Verificar seed idempotente e preservação de dados externos quando houver seed; se não houver, executar regressão das seeds anteriores; documentar data-base e contagens sem segredos.
- [ ] 3.3 Comparar runtime/respostas reais ao subconjunto normativo implementado: métodos, paths, operationIds, security, required, enums, query/body e status; executar lint OpenAPI sem alterar sistema/openapi.yaml e registrar resultado.

## 4. Regressão e evidências

- [ ] 4.1 Executar pela .venv Python 3.12 pytest tests/unit tests/contract e pytest tests/integration em PostgreSQL 16 exclusivo, ruff check --no-cache ., mypy e pip check; corrigir falhas e registrar resultados/skips reais em backend/EVIDENCIAS-M05.md.
- [ ] 4.2 Executar smoke das operações do módulo e regressão dos anteriores, revisar diff por segredos e escopo e entregar resumo BACK com riscos/pendências; verificar README backend reproduzível sem declarar G05 integrado.

## Workflow follow-up

- Commit e push exigem autorização separada, conferência da branch e checks reais; este planejamento não os executa.
- Revisão/merge pertence à equipe. FRONT/E2E/Compose/CI são dependências externas, sem alterações pelo BACK nesta solicitação.
- Somente após G05 integrado seguir a implementação seguinte; aprovação de artefatos não equivale a aprovação do gate.
