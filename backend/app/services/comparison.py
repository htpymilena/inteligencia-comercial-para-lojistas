from typing import Any

from app.services.metrics import Totals, differences

DISCLAIMER = "Comparação observacional; não prova causalidade."


def comparison(
    current: Totals, baseline: Totals, days: int, *, completed: bool = True
) -> dict[str, Any]:
    reason = None
    if not completed:
        reason = "Experimento ainda não concluído."
    elif current.days != days or baseline.days != days:
        reason = "Dados incompletos em uma das janelas."
    return {
        "available": reason is None,
        "reason": reason,
        "baseline": baseline.payload() if reason is None else None,
        "current": current.payload() if reason is None else None,
        "changes": differences(current, baseline) if reason is None else None,
        "disclaimer": DISCLAIMER,
        "data_origin": "DEMO",
    }
