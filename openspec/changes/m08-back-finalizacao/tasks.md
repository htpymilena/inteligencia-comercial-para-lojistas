# Tasks

Aprovação técnica do planejamento registrada conforme manifestação explícita do usuário nesta revisão. Nenhuma tarefa de implementação foi concluída ou autorizada para execução agora; os gates continuam obrigatórios.

Planejamento técnico aprovado; implementação não liberada. G00 não concluído. Implementação bloqueada até liberação para execução e cumprimento de M00–M06 integrados; G06 INTEGRADO; M07 dispensado sem autorização. Cenários abaixo preparados como documentação, não testes implementados/executados.

## 1. Pré-condições

- [ ] 1.1 Conferir aprovação explícita e evidências dos gates anteriores, base integrada e branch feat/m08-back-backend-release-readiness; verificar Git e registrar resultado sem alterar main.
- [ ] 1.2 Reconciliar componentes futuros deste design com implementações dependentes integradas; verificar contrato e registrar somente ajustes de caminhos sem mudar comportamento, encaminhando divergências materiais à revisão.

## 2. Persistência e domínio

- [ ] 2.1 Implementar a persistência prevista (nenhuma migration obrigatória; ajuste apenas se evidência justificar) sem create_all ou alterações destrutivas; verificar schema/constraints e cadeia Alembic em PostgreSQL 16 exclusivo quando aplicável e documentar os comandos.
- [ ] 2.2 Implementar e testar isolamento em regressão: quando lojista tenta todas as rotas de lojas externas, comprovar que recebe 403, ou 404 para recurso externo dentro de loja permitida, sem vazamento; documentar comportamento e fixture no relatório BACK.
- [ ] 2.3 Implementar e testar sem segredos: quando falhas de validação, SQL e token são exercitadas, comprovar que ApiError/logs não expõem senha, JWT, SQL ou credenciais; documentar comportamento e fixture no relatório BACK.
- [ ] 2.4 Implementar e testar reprodução: quando banco de teste novo recebe cadeia de migrations e seed dupla, comprovar que schema final e contagens são consistentes sem create_all ou duplicações; documentar comportamento e fixture no relatório BACK.
- [ ] 2.5 Implementar e testar backup de teste: quando dump sintético é restaurado em destino novo autorizado, comprovar que contagens e consultas conhecidas coincidem sem modificar a origem; documentar comportamento e fixture no relatório BACK.
- [ ] 2.6 Implementar e testar limites e demo: quando consultas de borda e respostas são inspecionadas, comprovar que limites contratuais são respeitados, DEMO e avisos permanecem, sem mídia pessoal; documentar comportamento e fixture no relatório BACK.
- [ ] 2.7 Implementar e testar evidência de entrega: quando checagens BACK passaram mas E2E ou revisão de equipe falta, comprovar que relatório registra a pendência e não declara G08 INTEGRADO; documentar comportamento e fixture no relatório BACK.

## 3. HTTP e integração BACK

- [ ] 3.1 Implementar/adaptar somente operações previstas (nenhuma operação nova; regressão de todas as operações implementadas M00–M06), com autorização M01 e ApiError; testar HTTP real contra PostgreSQL e registrar casos de sucesso/erro sem SQL ou credenciais em logs.
- [ ] 3.2 Verificar seed idempotente e preservação de dados externos quando houver seed; se não houver, executar regressão das seeds anteriores; documentar data-base e contagens sem segredos.
- [ ] 3.3 Comparar runtime/respostas reais ao subconjunto normativo implementado: métodos, paths, operationIds, security, required, enums, query/body e status; executar lint OpenAPI sem alterar sistema/openapi.yaml e registrar resultado.

## 4. Regressão e evidências

- [ ] 4.1 Executar pela .venv Python 3.12 pytest tests/unit tests/contract e pytest tests/integration em PostgreSQL 16 exclusivo, ruff check --no-cache ., mypy e pip check; corrigir falhas e registrar resultados/skips reais em backend/EVIDENCIAS-M08.md.
- [ ] 4.2 Executar smoke das operações do módulo e regressão dos anteriores, revisar diff por segredos e escopo e entregar resumo BACK com riscos/pendências; verificar README backend reproduzível sem declarar G08 integrado.

## Workflow follow-up

- Commit e push exigem autorização separada, conferência da branch e checks reais; este planejamento não os executa.
- Revisão/merge pertence à equipe. FRONT/E2E/Compose/CI são dependências externas, sem alterações pelo BACK nesta solicitação.
- Somente após G08 integrado seguir a implementação seguinte; aprovação de artefatos não equivale a aprovação do gate.
