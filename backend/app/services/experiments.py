from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.errors import DomainError
from app.experiment_dto import ExperimentCreateRequest, ExperimentResultResponse
from app.experiment_models import Experiment
from app.models import utcnow
from app.services.comparison import comparison
from app.services.metrics import MetricRepository, period
from app.services.recommendations import RecommendationRepository

TRANSITIONS = {"DRAFT": {"RUNNING", "CANCELLED"}, "RUNNING": {"COMPLETED", "CANCELLED"}}


def experiment_transition(current: str, target: str) -> None:
    if target not in TRANSITIONS.get(current, set()):
        raise DomainError(409, "CONFLICT", "Transição de experimento inválida")


class ExperimentRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, store: UUID, resource: UUID) -> Experiment | None:
        return self.session.scalar(
            select(Experiment).where(Experiment.store_id == store, Experiment.id == resource)
        )

    def listing(self, store: UUID) -> list[Experiment]:
        return list(
            self.session.scalars(
                select(Experiment)
                .where(Experiment.store_id == store)
                .order_by(Experiment.created_at, Experiment.id)
            )
        )

    def cas(self, row: Experiment, target: str) -> bool:
        result = self.session.execute(
            update(Experiment)
            .where(
                Experiment.store_id == row.store_id,
                Experiment.id == row.id,
                Experiment.status == row.status,
                Experiment.version == row.version,
            )
            .values(status=target, version=Experiment.version + 1, updated_at=utcnow())
            .execution_options(synchronize_session=False)
        )
        return bool(result.rowcount)


class ExperimentService:
    def __init__(self, session: Session) -> None:
        self.repository = ExperimentRepository(session)

    def get(self, store: UUID, resource: UUID) -> Experiment:
        row = self.repository.get(store, resource)
        if row is None:
            raise DomainError(404, "NOT_FOUND", "Experimento não encontrado")
        return row

    def create(self, store: UUID, body: ExperimentCreateRequest) -> Experiment:
        recommendation = RecommendationRepository(self.repository.session).get(
            store, body.recommendation_id
        )
        if recommendation is None:
            raise DomainError(404, "NOT_FOUND", "Recomendação não encontrada")
        if recommendation.status != "ACCEPTED":
            raise DomainError(409, "CONFLICT", "Recomendação deve estar aceita")
        row = Experiment(store_id=store, status="DRAFT", **body.model_dump())
        self.repository.session.add(row)
        self.repository.session.flush()
        return row

    def transition(self, store: UUID, resource: UUID, target: str) -> Experiment:
        row = self.get(store, resource)
        experiment_transition(row.status, target)
        if not self.repository.cas(row, target):
            raise DomainError(409, "CONFLICT", "Experimento já alterado")
        self.repository.session.refresh(row)
        return row

    def result(self, store: UUID, resource: UUID) -> ExperimentResultResponse:
        row = self.get(store, resource)
        before, last, days = period(row.start_date, row.end_date, limit=False)
        metrics = MetricRepository(self.repository.session)
        payload = comparison(
            metrics.totals(store, row.start_date, row.end_date),
            metrics.totals(store, before, last),
            days,
            completed=row.status == "COMPLETED",
        )
        payload["during"] = payload.pop("current")
        return ExperimentResultResponse(experiment_id=resource, **payload)
