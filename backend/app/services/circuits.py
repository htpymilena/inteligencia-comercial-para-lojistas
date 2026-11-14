from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import circuit_dto as dto
from app.circuit_models import Circuit
from app.core.errors import DomainError
from app.models import Store, utcnow

VALID_TRANSITIONS = {
    "DRAFT": {"ACTIVE", "CANCELLED"},
    "ACTIVE": {"FINISHED", "CANCELLED"},
    "FINISHED": set(),
    "CANCELLED": set(),
}


def to_dto(row: Circuit) -> dto.Circuit:
    return dto.Circuit(
        id=row.id,
        name=row.name,
        reward_description=row.reward_description,
        start_date=row.start_date,
        end_date=row.end_date,
        status=row.status,  # type: ignore[arg-type]
        store_ids=[UUID(str(s)) for s in row.store_ids],
        created_at=row.created_at,
    )


class CircuitRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, circuit_id: UUID) -> Circuit | None:
        return self.session.get(Circuit, circuit_id)

    def listing(self) -> list[Circuit]:
        return list(
            self.session.scalars(
                select(Circuit).order_by(Circuit.created_at.desc(), Circuit.id)
            )
        )

    def create(self, body: dto.CircuitCreateRequest) -> Circuit:
        for store_id in body.store_ids:
            if self.session.get(Store, store_id) is None:
                raise DomainError(404, "NOT_FOUND", f"Loja {store_id} não encontrada")

        row = Circuit(
            id=uuid4(),
            name=body.name,
            reward_description=body.reward_description,
            start_date=body.start_date,
            end_date=body.end_date,
            status="DRAFT",
            store_ids=[str(s) for s in body.store_ids],
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        self.session.add(row)
        self.session.flush()
        return row

    def update_status(self, row: Circuit, target_status: str) -> Circuit:
        allowed = VALID_TRANSITIONS.get(row.status, set())
        if target_status not in allowed:
            raise DomainError(409, "CONFLICT", f"Transição de {row.status} para {target_status} não permitida")
        row.status = target_status
        row.updated_at = utcnow()
        self.session.flush()
        return row
