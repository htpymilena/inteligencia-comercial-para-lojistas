# Tasks

Aprovação técnica do planejamento registrada conforme manifestação explícita do usuário nesta revisão. Nenhuma tarefa de implementação foi concluída ou autorizada para execução agora; os gates continuam obrigatórios.

Planejamento técnico aprovado; implementação não liberada. G00 não concluído. Implementação bloqueada até liberação para execução e cumprimento de M02 e M05; G05 INTEGRADO; regressão M00–M05. Cenários abaixo preparados como documentação, não testes implementados/executados.

## 1. Pré-condições

- [ ] 1.1 Conferir aprovação explícita e evidências dos gates anteriores, base integrada e branch feat/m06-back-comparative-reports; verificar Git e registrar resultado sem alterar main.
- [ ] 1.2 Reconciliar componentes futuros deste design com implementações dependentes integradas; verificar contrato e registrar somente ajustes de caminhos sem mudar comportamento, encaminhando divergências materiais à revisão.

## 2. Persistência e domínio

- [ ] 2.1 Implementar a persistência prevista (nenhuma migration obrigatória) sem create_all ou alterações destrutivas; verificar schema/constraints e cadeia Alembic em PostgreSQL 16 exclusivo quando aplicável e documentar os comandos.
- [ ] 2.2 Implementar e testar janela equivalente: quando consulta 2026-11-10..2026-11-12, comprovar que baseline_start/end são 2026-11-07..2026-11-09; documentar comportamento e fixture no relatório BACK.
- [ ] 2.3 Implementar e testar cálculo compartilhado: quando as mesmas métricas são consultadas por dashboard, experimento e relatório, comprovar que totais e taxas coincidem; conversão 20/300 retorna 6.67; documentar comportamento e fixture no relatório BACK.
- [ ] 2.4 Implementar e testar zero observado: quando duas janelas completas contêm contagens zero, comprovar que available=true e percentuais sem denominador são null, nunca NaN ou Infinity; documentar comportamento e fixture no relatório BACK.
- [ ] 2.5 Implementar e testar cobertura parcial: quando falta qualquer dia de uma janela, comprovar que available=false com motivo, baseline/current/changes null e aviso; documentar comportamento e fixture no relatório BACK.
- [ ] 2.6 Implementar e testar conversão em pontos: quando taxa passa de 10 a 15 por cento, comprovar que conversion_change_pp é 5 e não 50; documentar comportamento e fixture no relatório BACK.
- [ ] 2.7 Implementar e testar período inválido: quando datas invertidas ou intervalo de 367 dias é solicitado, comprovar que retorna 422 ApiError; intervalo de 366 é aceito; documentar comportamento e fixture no relatório BACK.

## 3. HTTP e integração BACK

- [ ] 3.1 Implementar/adaptar somente operações previstas (obterRelatorioComparativo), com autorização M01 e ApiError; testar HTTP real contra PostgreSQL e registrar casos de sucesso/erro sem SQL ou credenciais em logs.
- [ ] 3.2 Verificar seed idempotente e preservação de dados externos quando houver seed; se não houver, executar regressão das seeds anteriores; documentar data-base e contagens sem segredos.
- [ ] 3.3 Comparar runtime/respostas reais ao subconjunto normativo implementado: métodos, paths, operationIds, security, required, enums, query/body e status; executar lint OpenAPI sem alterar sistema/openapi.yaml e registrar resultado.

## 4. Regressão e evidências

- [ ] 4.1 Executar pela .venv Python 3.12 pytest tests/unit tests/contract e pytest tests/integration em PostgreSQL 16 exclusivo, ruff check --no-cache ., mypy e pip check; corrigir falhas e registrar resultados/skips reais em backend/EVIDENCIAS-M06.md.
- [ ] 4.2 Executar smoke das operações do módulo e regressão dos anteriores, revisar diff por segredos e escopo e entregar resumo BACK com riscos/pendências; verificar README backend reproduzível sem declarar G06 integrado.

## Workflow follow-up

- Commit e push exigem autorização separada, conferência da branch e checks reais; este planejamento não os executa.
- Revisão/merge pertence à equipe. FRONT/E2E/Compose/CI são dependências externas, sem alterações pelo BACK nesta solicitação.
- Somente após G06 integrado seguir a implementação seguinte; aprovação de artefatos não equivale a aprovação do gate.
