# 07 — Modelo de domínio e banco de dados (PostgreSQL)

**Fonte de estrutura HTTP:** `openapi.yaml`. Este documento especifica persistência, vínculos e decisões de integridade. Os nomes são referência para migrations; refatorações internas são permitidas sem quebrar contrato.

## 1. Diagrama lógico

```text
users ──< user_stores >── stores
                            ├──< daily_metrics
                            ├──< demo_cameras
                            ├──< store_zones
                            │       └──< heatmap_cells
                            ├──< monitoring_snapshots
                            ├──< recommendations
                            │       └──< experiments
                            └──< circuit_stores >── circuits
                                                        └──< circuit_demo_stats
```

**Associações:** uma loja tem muitas métricas, zonas, recomendações, câmeras e experiências; um circuito agrega exatamente três lojas por regra, representado por tabela de associação.

## 2. Entidades e colunas propostas

| Tabela | Atributos principais | Restrições / índices |
|---|---|---|
| `users` | `id uuid`, `email varchar(254)`, `password_hash`, `display_name`, `role`, `is_active`, `created_at` | email único case-insensitive (normalizado), papel enum/check |
| `stores` | `id uuid`, `name`, `segment`, `description`, `is_demo`, `created_at` | nome não vazio; `is_demo=true` no seed |
| `user_stores` | `user_id uuid`, `store_id uuid` | PK composta, FKs com integridade |
| `daily_metrics` | `id`, `store_id`, `metric_date date`, `visitor_count int`, `interaction_count int`, `sales_count int`, `revenue_brl numeric(14,2)`, `data_origin` | unique `(store_id, metric_date)`; números >=0; índice por loja/data |
| `demo_cameras` | `id`, `store_id`, `name`, `placement`, `status`, `is_simulated` | FK loja; sem campo RTSP/URL de vídeo real |
| `store_zones` | `id`, `store_id`, `name`, `grid_x`, `grid_y`, `grid_width`, `grid_height` | zonas contidas em grade 10×8; nome único por loja |
| `heatmap_cells` | `id`, `store_id`, `metric_date`, `grid_x`, `grid_y`, `intensity numeric(4,3)` | unique `(store_id, metric_date, grid_x, grid_y)`; 0 ≤ intensity ≤ 1; grid x 0..9, y 0..7 |
| `monitoring_snapshots` | `id`, `store_id`, `captured_at`, `people_now`, `entries_today`, `exits_today`, `zone_occupancy jsonb`, `data_origin` | counts >=0; `DEMO`; consulta último snapshot da loja |
| `recommendations` | `id`, `store_id`, `title`, `hypothesis`, `evidence`, `priority`, `status`, `generation_method`, `created_at`, `updated_at`, `version int` | enums; FK loja; version para atualização concorrente |
| `experiments` | `id`, `store_id`, `recommendation_id`, `title`, `metric`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`, `version` | FK da mesma loja checada no service; datas válidas |
| `circuits` | `id`, `name`, `reward_description`, `start_date`, `end_date`, `status`, `created_by`, `created_at`, `version` | início <= fim; status enum |
| `circuit_stores` | `circuit_id`, `store_id`, `position smallint` | PK `(circuit_id,store_id)`; unique `(circuit_id,position)`; 3 lojas via transação/service |
| `circuit_demo_stats` | `id`, `circuit_id`, `metric_date`, `completed_count`, `data_origin` | unique `(circuit_id,metric_date)`; count >=0; origem DEMO |

**PK:** UUID gerado no backend/DB. Tabelas de associação usam PK composta. Usuário/tokens de sessão **não** geram tabelas de visitantes. Nunca modelar face, pessoa rastreada, imagem ou vídeo.

## 3. Enumerações

```text
Role: ADMIN | LOJISTA
Origin: DEMO
CameraStatus: SIMULATED_ON | SIMULATED_OFF
Priority: HIGH | MEDIUM | LOW
RecommendationStatus: PROPOSED | ACCEPTED | DISMISSED
GenerationMethod: RULE_BASED_DEMO
ExperimentMetric: VISITORS | SALES | REVENUE | CONVERSION
ExperimentStatus: DRAFT | RUNNING | COMPLETED | CANCELLED
CircuitStatus: DRAFT | ACTIVE | FINISHED | CANCELLED
```

Usar `CHECK` ou enum controlado via migration, alinhado ao OpenAPI. Mudar um valor exige PR de contrato.

## 4. Cálculo e consistência

- Somatório de período: `SUM(visitor_count)`, `SUM(interaction_count)`, `SUM(sales_count)`, `SUM(revenue_brl)`.
- Conversão é calculada **sobre totais** (`SUM(sales)/SUM(visitors)×100`), nunca média simples das conversões diárias.
- Variação percentual é calculada pelo service em `Decimal` e serializada como número ou `null` conforme OpenAPI; faturamento como string decimal.
- Período de N dias (`start..end`, inclusive) tem comparação anterior `[start−N, start−1]`.
- Resultado de experimento considera janela **durante a ação** `[start_date..end_date]` e baseline anterior de N dias. Só fica `available=true` se status `COMPLETED` e cada dia de ambas as janelas existir; não imputar dias sem registros.
- Células de calor 10x8 usam `grid_x`, `grid_y` em coordenadas de grade, sem coordenada de pessoa.

## 5. Estratégia de migrations

| Marco | Migração | Critério |
|---|---|---|
| M00 | Base Alembic vazia | `alembic current` funciona |
| M01 | `users`, `stores`, `user_stores` | índices e constraints criadas |
| M02 | `daily_metrics` | unique loja/data e números não-negativos |
| M03 | `demo_cameras`, `store_zones`, `heatmap_cells`, `monitoring_snapshots` | grid e origem demo consistentes |
| M04 | `recommendations` | status/version |
| M05 | `experiments` | estados e vínculo |
| M06 | Nenhuma obrigatória | reusa dados existentes |
| M07 | `circuits`, `circuit_stores`, `circuit_demo_stats` | relação de três lojas |
| M08 | Índices/ajustes controlados | checar queries e rollback viável |

Executar `alembic upgrade head` antes do seed. **Não** executar `alembic downgrade base` em banco com dados de demonstração que deseja preservar; rollback somente em banco descartável e com respaldo.

## 6. Seed de demonstração (reprodutível)

- Usuário `ADMIN` e usuário `LOJISTA`, com emails demo definidos no script e **senhas provenientes de env**, nunca senha constante pública.
- Três lojas fictícias: Loja Moda, Loja Calçados e Loja Acessórios; segmentos distintos. `LOJISTA` recebe vínculo somente com Loja Moda para teste de isolamento.
- 60 dias corridos de métricas por loja, a partir de `DEMO_BASE_DATE` (default data da execução local), com fórmula determinística/seed fixa e índices únicos; registrar `DEMO_BASE_DATE` nos logs de seed.
- Até 80 células de calor por loja/dia para **7 dias demonstrativos recentes**, com intensidade estável; dias sem célula retornam estado vazio na API.
- Uma câmera fictícia e uma fotografia agregada por loja, sem imagem real.
- Pelo menos 3 recomendações por loja (prioridades diferentes, todas `RULE_BASED_DEMO`).
- Um experimento completo DEMO pode ser adicionado **apenas em M05**, com datas dentro da janela de métricas.
- Um circuito demonstrativo de três lojas só em M07.

**Idempotência:** `ON CONFLICT DO NOTHING`/upsert condicionado a `data_origin=DEMO` e chaves estáveis. Seeds não podem sobrescrever registros originados de outras fontes ou duplicar métricas a cada execução. Ter comando explícito `seed_demo`, não seedar automaticamente toda vez que API inicia.

## 7. Índices, consultas e isolamento

- `daily_metrics (store_id, metric_date)` único; ranges usam este índice.
- `recommendations (store_id, status, created_at)`.
- `experiments (store_id, created_at)`.
- `heatmap_cells (store_id, metric_date)`.
- `circuits` via `circuit_stores (store_id, circuit_id)`.
- Buscar entidades de `recommendations/experiments/zones` sempre com `(store_id, id)` quando houver loja na rota, para evitar IDOR.
- `circuits` acessíveis apenas se admin ou se ao menos um vínculo de loja autorizado existir.

## 8. Backups e migração de ambiente

Desenvolvimento mantém dados em volume nomeado do Compose; `docker compose down` preserva volume e `docker compose down -v` **apaga** o volume (executar apenas em ambiente demo descartável). Para evolução real, backup via `pg_dump` antes de migração, credenciais em segredo e restauração testada; nenhum dado sensível deve aparecer nos arquivos de documentação.
