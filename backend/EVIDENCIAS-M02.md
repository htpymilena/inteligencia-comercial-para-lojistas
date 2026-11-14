# M02 experimental — métricas

Autorização de desenvolvimento independente antes dos gates conforme pedido atual.
G00/G01/G02 continuam pendentes de integração. M01 experimental é a dependência local.

Implementados revision 002, métricas diárias, agregação SQL, cálculos Decimal,
dashboard, série diária e seed determinística. RN010 rejeita negativos, não finitos
e frações inválidas antes da escrita; RN011 não limita interações a visitantes.

Python 3.12.10 da .venv, comandos em backend/:

- `python -m pytest -q`: **27 passed, 6 skipped** (todos os skips são SQL).
- `python -m ruff check --fix --no-cache .`: passou após formatação/imports.
- `python -m mypy`: passou, 23 arquivos.
- Contrato normativo/runtime M00–M02 validado e comparado pela suite contract.

Cobertura unitária: finanças -0.01/1.234/NaN/Infinity/overflow recusados, Decimal,
conversão 6.67, null, pontos percentuais, janelas/366 dias e validação antes de SQL.
Persistência, seed dupla e constraints em PostgreSQL estão preparadas mas não
executadas: TEST_DATABASE_URL ausente. Aviso Starlette/AnyIO não bloqueante.
Não houve push, merge, E2E ou aprovação de gate.
