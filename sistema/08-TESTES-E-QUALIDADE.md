# 08 — Plano de testes, qualidade e aceite

**Princípio:** teste no mesmo módulo em que a funcionalidade é criada. Um PR que compila, mas não integra com a outra camada, **não** encerra o módulo.

## 1. Camadas de teste

| Camada | Ferramenta sugerida | Cobertura esperada |
|---|---|---|
| Unitário backend | pytest | conversão, intervalos, regras e transições |
| Integração backend | pytest + httpx + PostgreSQL teste | rotas, auth, isolamento, migrations e queries |
| Contrato | OpenAPI lint + comparação schema/runtime | nomes, tipos, required, status, operationId |
| Componentes frontend | Vitest + React Testing Library | botões, forms, loading, empty, erros |
| E2E | Playwright + Compose | jornadas reais browser → FastAPI → PostgreSQL |
| Qualidade | mypy/ruff (ou equivalentes), ESLint, tsc | importações, tipagem e padrões |
| Segurança | testes 401/403, auditoria env | JWT, IDOR, secrets em logs |

**Dados:** ambiente de testes separado da base de desenvolvimento; fixtures determinísticas. Nunca executar reset destrutivo em banco compartilhado.

## 2. Matriz de cenários por módulo

| Módulo | Happy path integrado | Erro/regressão que bloqueia gate |
|---|---|---|
| M00 | 3 serviços sobem; frontend alcança `/health` via proxy | DB não pronto; config ausente; volume errado |
| M01 | login → perfil → lista de lojas → abrir painel autorizado | senha inválida 401, sem token 401, outra loja 403 |
| M02 | filtro altera KPI e série diária corretamente | intervalo invertido 422, zero-base, loja fora do escopo |
| M03 | consultar monitoramento demo e mapa calor da loja | intensidade fora do range, ausência de zona, falsa captura real |
| M04 | aceitar/descartar e persistir recomendação | alteração repetida 409; ID de outra loja 404 |
| M05 | aceitar → criar → iniciar → concluir → comparar | recomendação não aceita, estado impossível, baseline ausente |
| M06 | relatório antes/depois em janelas iguais | cálculo por média de taxas, variação com divisor zero |
| M07 | admin cria circuito 3 lojas e ativa | duplicidade, 2/4 lojas, lojista criando, visibilidade externa |
| M08 | E2E completo e accessibility smoke | bug impeditivo reintroduzido |

## 3. Casos numéricos obrigatórios

### TEST-METRIC-01 — Conversão agregada

| Dia | Visitantes | Vendas |
|---|---:|---:|
| 1 | 100 | 10 |
| 2 | 200 | 10 |
| Total | 300 | 20 |

**Esperado:** `20 / 300 * 100 = 6,666…%`; arredondamento da resposta para duas casas (`6.67`), **não** média diária `(10%+5%)/2=7,5%`.

### TEST-METRIC-02 — Base zero

Se visitantes=0, vendas=0 → `conversion_rate=null`. Se total do período anterior=0 → `change_percent=null`. UI mostra `—` e não `0%`, `NaN` ou `Infinity`.

### TEST-METRIC-03 — Comparação por período

Período atual de 3 dias (`2026-11-10` até `2026-11-12`) compara com os 3 dias imediatamente anteriores (`2026-11-07` até `2026-11-09`). **Datas são exemplo fixo de teste**, não datas obrigatórias dos dados demo atuais.

### TEST-METRIC-04 — Decimal

Receita `0.10 + 0.20 = 0.30` em Decimal; response `"0.30"`, nunca `0.30000000000000004`.

## 4. Contratos, consistência e segurança

- Verificar que **todos** os `operationId` do módulo estão definidos em `docs/openapi.yaml` e implementados com as mesmas propriedades.
- Checar arrays, valores null, enums, `required`, códigos e status de erro; evitar `200` genérico para POST que o contrato define `201`.
- Autenticação: token omitido, malformado, expirado, assinatura inválida; `LOJISTA` em lojas alheias, admin em todas.
- Atualização concorrente de recomendação/experimento/circuito não pode perder transição inválida.
- Seeds podem ser executadas duas vezes sem mudar contagens ou criar duplicados.
- Nunca expor stack trace, senha ou JWT na resposta/log.

## 5. Testes de UI obrigatórios

- Teclado navega em sidebar, formulários, modais e botões.
- Mensagens de erro são legíveis e contextualizadas.
- `loading`, `empty`, `error` e `success` por tela/consulta.
- Em gráfico, título, unidades, legendas e alternativa textual/tabela para acesso sem visão de cores.
- `DEMO` está visível em câmera, mapa, recomendações, métricas e circuitos.
- Filtragem por loja não reaproveita cache de outra loja; filtros sempre acompanham URL/estado correto.

## 6. Roteiro E2E principal (M00–M06)

1. Iniciar ambiente limpo de **testes** e rodar migrations + seed demo.
2. Abrir `http://localhost:5173` e autenticar usuário LOJISTA de demonstração.
3. Confirmar que somente a loja atribuída está listada; abrir TELA003.
4. Alterar período e validar cards, série diária e badge DEMO.
5. Abrir monitoramento e mapa; verificar rotulagem `SIMULADO`/`DEMO` e células.
6. Abrir recomendações, aceitar uma e conferir estado persistido.
7. Criar experimento, iniciar e concluir (fixtures precisam representar datas válidas do ciclo); verificar resultado ou mensagem `available=false` sem números fabricados.
8. Abrir relatório e comparar com dados conhecidos.
9. Testar request direto à outra loja com mesmo JWT → 403; sair e verificar sessão inválida.

## 7. Pipeline mínimo por PR

```text
PR contrato: lint OpenAPI + revisão de ambos
PR backend: ruff + pytest unit + pytest integração em PostgreSQL teste
PR frontend: eslint + tsc --noEmit + vitest
PR integração: docker compose build + migrations + seed + smoke + playwright
main: repetir smoke + regressão de módulos anteriores
```

Se a infraestrutura CI não suportar Playwright/Compose, anexar log de execução local reproduzível e registrar lacuna, sem afirmar teste automatizado que não foi executado.

## 8. Critérios de aceite da entrega acadêmica

- A equipe explica o problema comercial e demonstra os fluxos principais.
- As telas previstas no escopo M00–M06 funcionam com **API real e dados demo persistidos**.
- A arquitetura, o banco e o Compose são reproduzíveis.
- Há documentação de limites das câmeras e do mecanismo de recomendações.
- O projeto não faz alegações enganadoras sobre IA, precisão, público identificado ou causalidade.
- A matriz de testes comprova integração por módulo; pendências do M07 são apresentadas com clareza.
