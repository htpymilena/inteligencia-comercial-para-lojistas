# Tasks

Execução experimental autorizada pelo usuário/equipe antes dos gates; branch experimental/backend-m01-m08. As condições de início e branch anteriores são substituídas por esta autorização, sem declarar integração. Código e testes disponíveis registrados em backend/EVIDENCIAS-M04.md. Tarefas que exigem SQL continuam pendentes sem TEST_DATABASE_URL.


Aprovação técnica do planejamento registrada conforme manifestação explícita do usuário nesta revisão. Nenhuma tarefa de implementação foi concluída ou autorizada para execução agora; os gates continuam obrigatórios.

Planejamento técnico aprovado; implementação não liberada. G00 não concluído. Implementação bloqueada até liberação para execução e cumprimento de M02 funcional; sequência exige G03 INTEGRADO após M03. Cenários abaixo preparados como documentação, não testes implementados/executados.

## 1. Pré-condições

- [ ] 1.1 Conferir aprovação explícita e evidências dos gates anteriores, base integrada e branch feat/m04-back-commercial-recommendations; verificar Git e registrar resultado sem alterar main.
- [ ] 1.2 Reconciliar componentes futuros deste design com implementações dependentes integradas; verificar contrato e registrar somente ajustes de caminhos sem mudar comportamento, encaminhando divergências materiais à revisão.

## 2. Persistência e domínio

- [ ] 2.1 Implementar a persistência prevista (recommendations) sem create_all ou alterações destrutivas; verificar schema/constraints e cadeia Alembic em PostgreSQL 16 exclusivo quando aplicável e documentar os comandos.
- [ ] 2.2 Implementar e testar lista explicável: quando loja consulta recomendações com filtro opcional, comprovar que recebe título, hipótese, evidência, prioridade, status e origem RULE_BASED_DEMO/DEMO; filtro inválido gera 422; documentar comportamento e fixture no relatório BACK.
- [ ] 2.3 Implementar e testar aceite ou descarte: quando recomendação PROPOSED recebe status permitido, comprovar que retorna 200 e novo estado persiste em sessão posterior; documentar comportamento e fixture no relatório BACK.
- [ ] 2.4 Implementar e testar terminal imutável: quando PATCH repete estado terminal ou tenta trocá-lo, comprovar que retorna 409 sem alterar registro; documentar comportamento e fixture no relatório BACK.
- [ ] 2.5 Implementar e testar concorrência: quando duas requisições simultâneas tentam encerrar a mesma proposta, comprovar que uma vence e a outra recebe 409; documentar comportamento e fixture no relatório BACK.
- [ ] 2.6 Implementar e testar id externo: quando cliente autorizado na loja usa recommendation_id de outra loja, comprovar que recebe 404 sem revelar dados externos; documentar comportamento e fixture no relatório BACK.
- [ ] 2.7 Implementar e testar seed preserva decisão: quando seed é repetida após aceite, comprovar que não duplica recomendações nem reabre estado terminal; documentar comportamento e fixture no relatório BACK.

## 3. HTTP e integração BACK

- [ ] 3.1 Implementar/adaptar somente operações previstas (listarRecomendacoes, atualizarRecomendacao), com autorização M01 e ApiError; testar HTTP real contra PostgreSQL e registrar casos de sucesso/erro sem SQL ou credenciais em logs.
- [ ] 3.2 Verificar seed idempotente e preservação de dados externos quando houver seed; se não houver, executar regressão das seeds anteriores; documentar data-base e contagens sem segredos.
- [ ] 3.3 Comparar runtime/respostas reais ao subconjunto normativo implementado: métodos, paths, operationIds, security, required, enums, query/body e status; executar lint OpenAPI sem alterar sistema/openapi.yaml e registrar resultado.

## 4. Regressão e evidências

- [ ] 4.1 Executar pela .venv Python 3.12 pytest tests/unit tests/contract e pytest tests/integration em PostgreSQL 16 exclusivo, ruff check --no-cache ., mypy e pip check; corrigir falhas e registrar resultados/skips reais em backend/EVIDENCIAS-M04.md.
- [ ] 4.2 Executar smoke das operações do módulo e regressão dos anteriores, revisar diff por segredos e escopo e entregar resumo BACK com riscos/pendências; verificar README backend reproduzível sem declarar G04 integrado.

## Workflow follow-up

- Commit e push exigem autorização separada, conferência da branch e checks reais; este planejamento não os executa.
- Revisão/merge pertence à equipe. FRONT/E2E/Compose/CI são dependências externas, sem alterações pelo BACK nesta solicitação.
- Somente após G04 integrado seguir a implementação seguinte; aprovação de artefatos não equivale a aprovação do gate.
