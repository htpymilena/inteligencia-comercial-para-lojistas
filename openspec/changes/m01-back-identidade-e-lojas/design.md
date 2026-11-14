# Design

## Context

Ver proposal.md para motivação e limites. A inspeção encontrou somente a aplicação M00: fábrica FastAPI, configuração DATABASE_URL, middleware de logs/500, schemas em app/schemas.py, engine/session e Alembic sem revisions. Não existem models, repositories, services ou autenticação para reutilizar. O contrato normativo está em sistema/openapi.yaml; referências docs/ da baseline correspondem a sistema/.

Consulta remota em 14/11/2026: backend-m00 em 83493c0 e main em 9e90afe; M00 não integrado. OpenSpec M00 mantém 8/27 tarefas concluídas. Este design é preparação; nenhuma implementação pode começar antes do G00 integrado e da aprovação humana desta proposta.

## Goals / Non-Goals

**Goals:** estabelecer separação router/service/repository, dependências de autenticação reutilizáveis e persistência transacional com testes isolados, preservando o diagnóstico HTTP M00 sem conexão SQL obrigatória.

**Non-Goals:** refresh, logout servidor, cadastro público, recuperação de senha, gestão de contas, dados de métricas ou circuitos. Nenhuma mudança em FRONT, contrato ou infraestrutura compartilhada.

## Decisions

1. **Persistência:** usar Base, build_engine e session_scope existentes; uma revision Alembic M01 cria users, stores, user_stores, UUIDs, timestamps UTC, email normalizado único, check de papel e FKs/PK composta. Importar modelos no env Alembic. Não usar create_all: migration verificável preserva versionamento. Criar sessão por requisição e descartar engine no shutdown; startup valida configuração mas não conecta ao banco, preservando /health.

2. **Camadas:** introduzir app/models, repositories, services e api/v1/routers. Controllers adaptam HTTP; serviços controlam acesso; repositories executam consultas SQL filtradas. Manter app/schemas.py compatível e colocar novos DTOs em módulo próprio, evitando troca desnecessária de pacote. current_user valida token e consulta usuário ativo; require_store_access confere ADMIN ou associação antes de buscar dados da loja. O papel persistido é a autoridade, não um papel antigo no token.

3. **Segurança:** propor argon2-cffi para hash e PyJWT para HS256 com algoritmo permitido fixo. JWT exige sub UUID, role válido e exp, TTL 30 minutos UTC; rejeitar assinatura/claims inválidas e algoritmos diferentes. Comparar senha inexistente contra hash fictício para reduzir diferença temporal. Erro 401 genérico para credencial incorreta, inexistente ou conta inativa. Bibliotecas consolidadas evitam criptografia manual. Fixar versões exatas e lock na implementação, após conferir compatibilidade Python 3.12.

4. **Configuração:** acrescentar JWT_SECRET SecretStr obrigatório e validar chave com pelo menos 32 bytes, sem valor padrão. Senhas DEMO_ADMIN_PASSWORD e DEMO_LOJISTA_PASSWORD obrigatórias somente para comando seed, nunca para /health. Não carregar .env automaticamente. Atualizar fixtures sintéticas de configuração para a nova exigência e preservar testes de ausência/segredo saneado. Proxy continua com equipe; não alterar CORS/Compose unilateralmente.

5. **HTTP:** implementar somente as quatro operações M01 com UUID, EmailStr, campos obrigatórios/extras e security conforme contrato. Email validator deve aceitar o domínio reservado demo.invalid com validação sintática sem DNS. Hash nunca integra User. Tratar validação FastAPI e erros de domínio como ApiError, sem ecoar inputs. Middleware existente fornece o mesmo request_id ao corpo/cabeçalho/log; handlers usam esse ID para 401/403/404/422, mantendo 500 saneado. Ausência de Bearer deve ser 401, evitando 403 padrão da dependência. Não publicar operações futuras no runtime.

6. **Seed:** comando explícito app.seed_demo, após upgrade head. UUIDs e emails demo estáveis (admin@demo.invalid, lojista@demo.invalid), três lojas com is_demo=true, LOJISTA somente na Moda. Reservar namespace de IDs e verificar identidade dos registros antes de reutilizar; colisão externa aborta toda a transação. Usar inserts condicionais, sem sobrescrever senha ou atualizar registros externos. Não criar dados de módulos seguintes. Reexecução preserva hashes e IDs; sem senha, validar antes de abrir transação de escrita.

7. **Testes:** manter unitários de segurança/serviços sem SQL; integração HTTP real via TestClient e PostgreSQL 16 de TEST_DATABASE_URL exclusivamente. Schema único por execução, search_path aplicado também ao subprocesso Alembic, sem reset de banco ou remoção automática de schemas. Fixtures usam transação/rollback para dados transitórios. Verificar upgrade e current, constraints, login/perfil, isolamento e seed dupla. Downgrade somente em schema descartável exclusivo com autorização específica; não executar downgrade ou drop em banco compartilhado. Registrar schema técnico criado e pendência de limpeza sem URL.

8. **Contrato e entrega:** ampliar teste contratual existente que hoje exige somente /health para subconjunto M00+M01, mantendo cobertura M00. Comparar schemas, bodies, enums, required, status, operationIds e security e validar respostas reais. Lint OpenAPI com ferramenta Python fixada em backend, sem configurar CI ou alterar YAML. Executar ruff, mypy, pip check e regressão. Registrar comandos/resultados reais em backend, tarefas e resumo PR. Criar feat/m01-back-identidade-lojas da main atualizada somente após integração M00; commit do módulo validado e push somente à branch autorizada. G01 depende de integração FRONT/equipe; BACK pronto não libera M02.

## Risks / Trade-offs

- [G00 pendente] → implementação bloqueada; revisão documental independente pode continuar.
- [Tempo curto] → não reduzir escopo ou fabricar evidência; reportar tarefas restantes e interromper em bloqueio.
- [Regressão em configuração/teste OpenAPI M00] → adaptar expectativas apenas para autenticação nova, preservando /health público e sem SQL.
- [Banco de teste não acessível] → sem fallback para DATABASE_URL/SQLite; integração pendente impede declarar BACK validado.
- [Schema isolado requer permissão] → usar banco exclusivo fornecido pela equipe ou registrar bloqueio; nunca migrar banco de desenvolvimento por substituição silenciosa.
- [Seed colide com dados externos] → validação prévia e rollback transacional; sem redefinir senha automaticamente.
- [Dependências novas] → resolver/pinar manifest e lock em Python 3.12; falha de instalação deve ser registrada.

## Migration Plan

1. Após aprovação e G00 integrado, criar branch a partir da main atualizada e revalidar baseline.
2. Implementar e testar revision M01 em schema de teste exclusivo, sem criar tabelas na importação.
3. Executar seed explícita, testes e verificações; documentar configuração sem segredos.
4. Em base de demonstração autorizada, aplicar upgrade head e seed; nenhuma alteração destrutiva automática. Em falha, preservar dados e corrigir por migration controlada.
5. Commit/push do BACK para revisão, sem merge. Equipe integra FRONT e comprova G01 antes do M02.
