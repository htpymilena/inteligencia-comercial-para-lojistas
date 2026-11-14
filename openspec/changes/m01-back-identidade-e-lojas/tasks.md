# Tasks

Execução experimental autorizada posteriormente pelo usuário/equipe antes do G00. Branch experimental/backend-m01-m08 baseada em backend-m00; essa autorização substitui as condições anteriores de início/branch para desenvolvimento independente, sem concluir gates. Tarefas SQL permanecem pendentes sem TEST_DATABASE_URL. Não há autorização de push nesta etapa.



Planejamento técnico aprovado explicitamente pelo usuário em 14/11/2026. G00 permanece PENDENTE nos registros consultados; a implementação não está liberada enquanto esse gate impedir o início. A tarefa 1.1 permanece desmarcada porque também exige evidências do G00 e conferência da main. Referências: proposal.md, design.md, três specs desta mudança e documentos normativos em sistema/.

Atividades independentes permitidas: análise documental, registro de aprovação, preparação do checklist de dependências e verificação somente de leitura do Git/ambiente. Não iniciar código, migrations, alteração de dependências ou configuração M01 enquanto G00 estiver pendente. Não há tarefa de implementação liberada neste estado.

## 1. Condições de início e dependências

- [ ] 1.1 Registrar aprovação explícita da proposta e evidências da equipe de G00 INTEGRADO (PRs M00 integrados, FRONT/proxy/Compose e regressão); conferir que main contém a entrega antes de iniciar código, sem marcar gate por inferência.
- [ ] 1.2 Criar branch feat/m01-back-identidade-lojas a partir da main atualizada; verificar git status, base e diff limitado ao BACK e artefatos OpenSpec, preservando a entrega backend-m00.
- [x] 1.3 Fixar dependências JWT, Argon2, email e lint contratual em backend/pyproject.toml e requirements.lock com Python 3.12 da .venv; verificar instalação pelo lock e pip check, sem ferramentas globais ou infra compartilhada.

## 2. Configuração e persistência

- [x] 2.1 Acrescentar configuração saneada de JWT_SECRET e validar requisitos do segredo; testar ausência, valor inválido e não exposição; documentar variáveis no README backend sem valores reais, preservando saúde sem conexão SQL.
- [ ] 2.2 Criar models e revision Alembic para users, stores e user_stores com UUIDs, UTC, email normalizado único, papéis e FKs; verificar upgrade head/current e constraints em schema PostgreSQL 16 exclusivo via TEST_DATABASE_URL, sem create_all/reset/downgrade destrutivo; documentar comandos e isolamento.
- [ ] 2.3 Integrar ciclo de engine/sessão por dependências sem conexão obrigatória no startup; testar commit/rollback, devolução de conexão e descarte, além de /health sem SQL; atualizar documentação de lifecycle.

## 3. Autenticação e erros

- [x] 3.1 Implementar hash Argon2 e JWT HS256 com sub, role, exp e TTL 30 minutos; testar senha correta/incorreta, hash fictício, assinatura/algoritmo inválidos, expiração, claims ausentes e diagnóstico saneado; documentar decisões de segurança.
- [ ] 3.2 Implementar login e obterPerfil em router/service/repository com schemas contratuais; testar conta ativa, email normalizado, senha incorreta, conta inexistente/inativa, usuário removido/desativado após emissão e token ausente; verificar respostas 200/401 e campos públicos em integração PostgreSQL.
- [x] 3.3 Adaptar validação e erros de domínio a ApiError com request_id consistente no corpo/cabeçalho/log; testar 422 sem eco de senha, falha controlada 500, códigos contratuais e ausência de segredos; documentar respostas no README backend.

## 4. Autorização por loja

- [ ] 4.1 Implementar current_user/require_store_access e listarLojas/obterLoja com autorização antes de consultar conteúdo; testar ADMIN sem vínculos, LOJISTA autorizado, loja de terceiro 403, lista vazia, UUID inválido 422 e loja inexistente para ADMIN 404 usando PostgreSQL; documentar política.
- [ ] 4.2 Testar chamadas diretas e identidade persistida como autoridade após mudança de papel/vínculo; comprovar isolamento, 401 sem token e ausência de dados externos em resposta/log, registrando cenários no relatório BACK.

## 5. Seed explícita de identidade

- [ ] 5.1 Implementar seed transacional de três lojas e duas contas com IDs estáveis, senhas via ambiente e vínculo LOJISTA somente na Moda; testar execução inicial, hashes e ausência de seed no startup; documentar comando Python e pré-requisito de migrations.
- [ ] 5.2 Testar seed dupla, preservação de hashes/IDs/contagens e colisão com registro externo sem sobrescrita; testar senha ausente antes de escrita e rollback de falha, sem registrar valores; registrar evidências de idempotência e proteção.

## 6. Verificação final do BACK

- [ ] 6.1 Ampliar testes contratuais para M00+M01 e executar lint do YAML normativo sem alterá-lo; comparar paths, operationIds, security, status, schemas, enums, required e respostas reais 200/401/403/404/422/500, sem anunciar módulos futuros.
- [ ] 6.2 Executar pytest unit/contract/integration, ruff, mypy, pip check e smoke HTTP de saúde/login/perfil/lojas no estado final; registrar comandos, resultados, skips e avisos em backend/EVIDENCIAS-M01.md, sem declarar sucesso SQL se não executado.
- [ ] 6.3 Revisar diff e evidências, conferir ausência de segredos/FRONT/infra e criar commit do BACK validado na branch autorizada; verificar git show/status e registrar hash, riscos e pendências no resumo de entrega, sem declarar G01 integrado.
- [ ] 6.4 Fazer push somente de feat/m01-back-identidade-lojas após confirmar autorização e autenticação; verificar referência remota igual ao commit local e registrar resultado, sem merge na main; falha de autenticação exige parar e informar.

## Workflow follow-up

- A equipe revisa e integra o PR BACK; o agente não faz merge na main.
- FRONT/equipe conectam API real, executam E2E/regressão, integram PR FRONT e registram G01 antes de M02.
- Arquivar esta mudança somente após revisão e pedido apropriado. Artefatos prontos não significam tarefas implementadas ou gates aprovados.
