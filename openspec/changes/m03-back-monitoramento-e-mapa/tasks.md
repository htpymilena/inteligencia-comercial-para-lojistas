# Tasks

Execução experimental autorizada pelo usuário/equipe antes dos gates; branch experimental/backend-m01-m08. As condições de início e branch anteriores são substituídas por esta autorização, sem declarar integração. Código e testes disponíveis registrados em backend/EVIDENCIAS-M03.md. Tarefas que exigem SQL continuam pendentes sem TEST_DATABASE_URL.


Aprovação técnica do planejamento registrada conforme manifestação explícita do usuário nesta revisão. Nenhuma tarefa de implementação foi concluída ou autorizada para execução agora; os gates continuam obrigatórios.

Planejamento técnico aprovado; implementação não liberada. G00 não concluído. Implementação bloqueada até liberação para execução e cumprimento de M02; G02 INTEGRADO. Cenários abaixo preparados como documentação, não testes implementados/executados.

## 1. Pré-condições

- [ ] 1.1 Conferir aprovação explícita e evidências dos gates anteriores, base integrada e branch feat/m03-back-demo-monitoring; verificar Git e registrar resultado sem alterar main.
- [ ] 1.2 Reconciliar componentes futuros deste design com implementações dependentes integradas; verificar contrato e registrar somente ajustes de caminhos sem mudar comportamento, encaminhando divergências materiais à revisão.

## 2. Persistência e domínio

- [ ] 2.1 Implementar a persistência prevista (demo_cameras, store_zones, heatmap_cells, monitoring_snapshots) sem create_all ou alterações destrutivas; verificar schema/constraints e cadeia Alembic em PostgreSQL 16 exclusivo quando aplicável e documentar os comandos.
- [ ] 2.2 Implementar e testar demo explícita: quando cliente consulta câmera e snapshot existentes, comprovar que recebe somente dados sintéticos com is_simulated=true e origem DEMO, sem URL de vídeo; documentar comportamento e fixture no relatório BACK.
- [ ] 2.3 Implementar e testar grade completa: quando consulta data incluída na seed, comprovar que recebe 80 coordenadas únicas com intensidade entre 0 e 1 e grade 10x8; documentar comportamento e fixture no relatório BACK.
- [ ] 2.4 Implementar e testar dia sem dados: quando consulta data não semeada, comprovar que recebe 200 cells=[] e insights=[] sem fallback; documentar comportamento e fixture no relatório BACK.
- [ ] 2.5 Implementar e testar snapshot ausente: quando loja autorizada não tem snapshot, comprovar que recebe 404 ApiError; documentar comportamento e fixture no relatório BACK.
- [ ] 2.6 Implementar e testar limites espaciais: quando seed ou fixture tenta coordenada fora da grade ou zona transbordando, comprovar que validação rejeita dado e nenhuma resposta inválida é persistida; documentar comportamento e fixture no relatório BACK.
- [ ] 2.7 Implementar e testar reexecução: quando seed roda duas vezes com data-base fixa, comprovar que mantém IDs e contagens, sem sobrescrever registros externos; documentar comportamento e fixture no relatório BACK.

## 3. HTTP e integração BACK

- [ ] 3.1 Implementar/adaptar somente operações previstas (listarCamerasDemo, obterMonitoramentoDemo, listarZonas, obterMapaCalorDemo), com autorização M01 e ApiError; testar HTTP real contra PostgreSQL e registrar casos de sucesso/erro sem SQL ou credenciais em logs.
- [ ] 3.2 Verificar seed idempotente e preservação de dados externos quando houver seed; se não houver, executar regressão das seeds anteriores; documentar data-base e contagens sem segredos.
- [ ] 3.3 Comparar runtime/respostas reais ao subconjunto normativo implementado: métodos, paths, operationIds, security, required, enums, query/body e status; executar lint OpenAPI sem alterar sistema/openapi.yaml e registrar resultado.

## 4. Regressão e evidências

- [ ] 4.1 Executar pela .venv Python 3.12 pytest tests/unit tests/contract e pytest tests/integration em PostgreSQL 16 exclusivo, ruff check --no-cache ., mypy e pip check; corrigir falhas e registrar resultados/skips reais em backend/EVIDENCIAS-M03.md.
- [ ] 4.2 Executar smoke das operações do módulo e regressão dos anteriores, revisar diff por segredos e escopo e entregar resumo BACK com riscos/pendências; verificar README backend reproduzível sem declarar G03 integrado.

## Workflow follow-up

- Commit e push exigem autorização separada, conferência da branch e checks reais; este planejamento não os executa.
- Revisão/merge pertence à equipe. FRONT/E2E/Compose/CI são dependências externas, sem alterações pelo BACK nesta solicitação.
- Somente após G03 integrado seguir a implementação seguinte; aprovação de artefatos não equivale a aprovação do gate.
