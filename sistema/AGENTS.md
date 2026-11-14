# Instruções para agentes — NEXO 2031

1. Leia `README.md`, `docs/06-MAPA-MODULOS.md`, `docs/05-INTEGRACAO.md` e `docs/openapi.yaml` antes de editar código.
2. Execute **um módulo MXX por vez** e respeite o *gate* de integração. Não adiante módulos ou faça refatoração geral sem necessidade.
3. **Agente BACK:** edita `backend/**`, testes de backend e migrações. **Agente FRONT:** edita `frontend/**`, testes de frontend e E2E. Alterações em `docs/openapi.yaml`, infra ou padrões compartilhados exigem acordo e PR específico.
4. Backend: FastAPI + Pydantic + serviços + repositórios SQLAlchemy + PostgreSQL. Frontend: React + TypeScript + páginas/hooks/client HTTP; não criar banco ou regras de autorização no navegador.
5. Contrato HTTP em `docs/openapi.yaml` é normativo: não renomear rotas, atributos, enums, códigos ou `operationId` por conta própria.
6. Dados de câmera, mapas, fluxo e inferências devem ser **rotulados DEMO** e reproduzíveis. Nunca criar falsa transmissão real.
7. Implementar validação/erros/estados loading-vazio-erro e testes do próprio lado em cada entrega.
8. Reutilizar módulos, componentes e migrations já existentes. Não apagar dados, migrar tabelas à força ou executar comando destrutivo sem autorização.
9. Branches: `feat/mXX-back-<assunto>` e `feat/mXX-front-<assunto>`; integração entra em `main` por PR revisado, não por push direto.
10. Antes do merge: backend atende OpenAPI, frontend consome API real, fluxo E2E funciona, seed/demo é consistente, checklists do módulo e regressão passam.
11. Encerre cada PR com: módulo, arquivos alterados, operações implementadas, comandos/testes realizados, resultados, riscos e pendências.
12. Consultar `docs/10-AGENTES-GIT-E-CHECKPOINTS.md` para prompts e sequência operacional.
