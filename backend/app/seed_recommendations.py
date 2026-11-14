from sqlalchemy.orm import Session

from app.recommendation_models import Recommendation
from app.seed_demo import STORE_IDS
from app.seed_monitoring import stable


def seed_recommendations(session: Session) -> None:
    for store in STORE_IDS:
        for index, priority in enumerate(("HIGH", "MEDIUM", "LOW")):
            resource = stable(f"recommendation/{store}/{index}")
            existing = session.get(Recommendation, resource)
            if existing is not None:
                if existing.store_id != store or existing.data_origin != "DEMO":
                    raise RuntimeError("Colisão de recomendação DEMO")
                continue  # Preserve terminal decisions and evidence.
            session.add(
                Recommendation(
                    id=resource,
                    store_id=store,
                    title=("Testar vitrine", "Revisar sinalização", "Ajustar atendimento")[index],
                    hypothesis="Hipótese comercial ilustrativa; não representa predição treinada.",
                    evidence=f"Cenário fictício DEMO {index + 1}, reproduzível por seed.",
                    priority=priority,
                    status="PROPOSED",
                    generation_method="RULE_BASED_DEMO",
                    data_origin="DEMO",
                )
            )
    session.flush()
