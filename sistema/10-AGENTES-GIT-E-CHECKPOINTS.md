# 10 — Dois agentes, Git, PRs e checkpoints

**Objetivo:** executar o projeto no **mesmo repositório** sem colisões, evitando que o frontend seja integrado apenas quando todo o backend estiver pronto.

## 1. Estratégia Git recomendada

```text
main (sempre demonstrável e com testes verdes)
  ├─ docs/mXX-contrato            (opcional, aprovado por ambos)
  ├─ feat/mXX-back-<assunto>     (Agente BACK)
  └─ feat/mXX-front-<assunto>    (Agente FRONT)
```

- Um **único remoto** Git (GitHub/GitLab), dois clones ou dois `git worktree` independentes (preferível, para não editar a mesma árvore de trabalho simultaneamente).
- Agente BACK é dono de `backend/**`; Agente FRONT é dono de `frontend/**`.
- `docs/openapi.yaml`, raiz/Compose, infra/CI e `AGENTS.md` são **compartilhados**. Para mudá-los: mini-PR próprio, revisão dos dois e merge antes do código dependente.
- Não editar a mesma branch, não executar dois agentes no mesmo diretório de trabalho, não usar `git push --force` em branch compartilhada nem merge direto em `main`.
- Branches pequenas, focadas em MXX; `main` recebe código por Pull Request com resumo e testes.

## 2. Duas opções para máquinas/ambientes

### Opção A — clones separados (mais simples)

```text
Agente BACK:  ~/dev/nexo-back    → clone do mesmo repo, branch feat/m02-back-...
Agente FRONT: ~/dev/nexo-front   → clone do mesmo repo, branch feat/m02-front-...
```

Cada um abre seu clone no Codex; depois de merge back, front sincroniza com `origin/main` e testa.

### Opção B — `git worktree` (se for mesma máquina)

```bash
# no repositório principal, após a main estar atualizada
git worktree add ../nexo-back -b feat/m02-back-dashboard
git worktree add ../nexo-front -b feat/m02-front-dashboard
```

**Atenção:** contêineres de Compose de clones simultâneos disputam portas 5173/8000/5432. Deixe apenas **um ambiente integrado** rodando ao mesmo tempo, ou use projetos Compose/portas distintos e bancos de desenvolvimento isolados. A integração final deve ser feita a partir da branch frontend atualizada com `main`.

## 3. Sequência segura de merge (por módulo)

1. PR de contrato (se necessário) → revisão de ambos → merge `main`.
2. `BACK` e `FRONT` abrem branches a partir da `main` atualizada.
3. Trabalham em paralelo em áreas distintas. Front pode usar fixtures *temporárias*.
4. BACK envia PR; testes backend/contrato passam → revisão → merge em `main`.
5. FRONT executa `git fetch origin` e integra `origin/main` em sua branch:

   ```bash
   git checkout feat/m02-front-dashboard
   git fetch origin
   git merge origin/main          # ou rebase, apenas se combinaram essa política
   ```

6. FRONT conecta à API real e executa smoke/E2E com Compose; BACK corrige problemas em PR separado se necessário.
7. FRONT abre PR de integração, testes passam → merge em `main`.
8. Equipe roda Compose sobre `main`, marca checkpoint e só então libera módulo seguinte.

**Não recomendado:** `merge` indiscriminado da branch backend diretamente na frontend enquanto ela ainda tem commits não revisados. **Também não recomendado:** BACK implementar M02–M07 antes do FRONT começar a conectar M02.

## 4. Checkpoints do projeto (preencher ao executar)

| Gate | Módulo | Estado inicial | Evidência a registrar |
|---|---|---|---|
| G00 | M00 Infra | PENDENTE | URL `/health`, captura browser e logs Compose |
| G01 | M01 Auth/lojas | PENDENTE | login válido, 401, 403 e seed |
| G02 | M02 Dashboard | PENDENTE | consulta DB, gráfico e números conhecidos |
| G03 | M03 Monitoramento/mapa | PENDENTE | captura DEMO, grid e vazios |
| G04 | M04 Recomendações | PENDENTE | PATCH persistido, conflito 409 |
| G05 | M05 Experimentos | PENDENTE | timeline, cálculos, regra de status |
| G06 | M06 Relatórios | PENDENTE | antes/depois, pp, CSV opcional |
| G07 | M07 Circuitos | PENDENTE / OPCIONAL | 3 lojas, permissão ADMIN, DEMO |
| G08 | M08 Finalização | PENDENTE | regressão e roteiro acadêmico |

**Estados permitidos:** `PENDENTE → CONTRATO_APROVADO → BACK_PRONTO → EM_INTEGRACAO → INTEGRADO`. `BLOQUEADO` pode ser usado a qualquer momento com motivo e PR de correção. Tabela acima é template: não marcar como concluído sem execução real.

## 5. Checklist de aprovação de Pull Request

```md
## PR — MXX / BACK ou FRONT
- Escopo: [funções alteradas]
- Contratos OpenAPI: [operationIds]
- Migração/seed: [nome ou não se aplica]
- Testes executados: [comando e resultado real]
- E2E no Compose: [passou / pendente / não se aplica]
- Screenshots/logs: [links ou caminhos do repositório]
- Possíveis regressões: [itens]
- Alterações de contrato: [nenhuma / PR aprovado]
- Pendências: [itens e severidade]
- Próximo passo: [integração/merge/checkpoint]
```

## 6. Prompt-base para o AGENTE BACK

> Você é o agente BACK do NEXO 2031. Leia `AGENTS.md`, `docs/01-PRD.md`, `docs/02-ESPECIFICACAO-TECNICA.md`, `docs/04-REGRAS-NEGOCIO.md`, `docs/05-INTEGRACAO.md`, `docs/06-MAPA-MODULOS.md`, `docs/07-MODELO-DADOS.md` e `docs/openapi.yaml`. Trabalhe **somente no módulo MXX indicado**. Implemente exclusivamente alterações em `backend/**`, com migrations, models, schemas Pydantic, repositories, services e controllers FastAPI; respeite a autorização por loja e os `operationId`/schemas existentes. Não faça alteração unilateral no contrato, frontend, Compose ou regras globais. Escreva testes pytest de sucesso, erro, acesso e persistência. Não processe imagens reais; dados são DEMO. Ao terminar, apresente arquivos, comandos de teste e resultado real, riscos e endpoints. Não passe ao próximo módulo sem integração aprovada.

## 7. Prompt-base para o AGENTE FRONT

> Você é o agente FRONT do NEXO 2031. Leia `AGENTS.md`, `docs/01-PRD.md`, `docs/03-MAPEAMENTO-TELAS.md`, `docs/05-INTEGRACAO.md`, `docs/06-MAPA-MODULOS.md`, `docs/08-TESTES-E-QUALIDADE.md` e `docs/openapi.yaml`. Trabalhe **somente no módulo MXX indicado** em `frontend/**`. Implemente páginas React/TypeScript, hooks, serviços HTTP tipados conforme OpenAPI, estados loading/vazio/erro/403, navegação e testes Vitest/RTL. Inicialmente use fixtures apenas se a API MXX ainda não estiver pronta. Após merge do backend, sincronize `main`, remova mocks ativos no fluxo, integre e teste com Compose e Playwright. Não modifique contrato nem backend unilateralmente. Não apresente dados de câmeras ou IA simulados como reais. Relate testes efetivamente realizados e pendências; não avance sem gate integrado.

## 8. Prompt coordenador por módulo (copiar no início do MXX)

> Vamos implementar o módulo **MXX — [nome]**. Base: `docs/06-MAPA-MODULOS.md`, contratos de `docs/openapi.yaml` e respectivas TELA/RF/RN. Cada agente deve conferir branch isolada e listar seus arquivos e testes. Antes de codar, responder com o *escopo exato*, dependências e dúvidas de contrato. Se não houver conflito, começar backend e frontend em paralelo. Depois do backend na main, integrar frontend com a API real e validar o gate GXX. Não mexer em módulos seguintes nem marcar progresso não executado.

## 9. Correção incremental e preservação do sistema

- Bug pequeno após integração: criar `fix/mXX-descricao`, teste de regressão e PR estreito. Não reescrever todos os controllers/components.
- Refatoração transversal: RFC/ADR curta com impacto em contratos, testes e migrations antes de executar.
- Mudança em DB: migration, nunca reset de dados como solução padrão.
- Mudança em API: atualizar OpenAPI, testes backend, client tipado e, se breaking, combinar antes.
- Congelar `main` para demo final; não integrar experimentos não testados de última hora.

## 10. Critério de passagem para próximo módulo

Somente com **ambos os PRs integrados**, fluxo ponta a ponta usando API real, autorização/erros verificados, seed demo consistente, regressão anterior passando e documentos ajustados. Se faltar qualquer item, status é `EM_INTEGRACAO` ou `BLOQUEADO`, nunca `INTEGRADO`.
