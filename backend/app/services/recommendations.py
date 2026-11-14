from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.errors import DomainError
from app.models import utcnow
from app.recommendation_models import Recommendation


def recommendation_transition(current: str, target: str) -> None:
    if current != "PROPOSED" or target not in ("ACCEPTED", "DISMISSED"):
        raise DomainError(409, "CONFLICT", "Transição de recomendação inválida")


class RecommendationRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def listing(self, store: UUID, status: str | None) -> list[Recommendation]:
        query = select(Recommendation).where(Recommendation.store_id == store)
        if status is not None:
            query = query.where(Recommendation.status == status)
        return list(
            self.session.scalars(query.order_by(Recommendation.created_at, Recommendation.id))
        )

    def get(self, store: UUID, resource: UUID) -> Recommendation | None:
        return self.session.scalar(
            select(Recommendation).where(
                Recommendation.store_id == store, Recommendation.id == resource
            )
        )

    def cas(self, row: Recommendation, target: str) -> bool:
        result = self.session.execute(
            update(Recommendation)
            .where(
                Recommendation.store_id == row.store_id,
                Recommendation.id == row.id,
                Recommendation.status == "PROPOSED",
                Recommendation.version == row.version,
            )
            .values(status=target, version=Recommendation.version + 1, updated_at=utcnow())
            .execution_options(synchronize_session=False)
        )
        return bool(result.rowcount)


class RecommendationService:
    def __init__(self, session: Session) -> None:
        self.repository = RecommendationRepository(session)

    def transition(self, store: UUID, resource: UUID, target: str) -> Recommendation:
        row = self.repository.get(store, resource)
        if row is None:
            raise DomainError(404, "NOT_FOUND", "Recomendação não encontrada")
        recommendation_transition(row.status, target)
        if not self.repository.cas(row, target):
            raise DomainError(409, "CONFLICT", "Recomendação já alterada")
        self.repository.session.refresh(row)
        return row
