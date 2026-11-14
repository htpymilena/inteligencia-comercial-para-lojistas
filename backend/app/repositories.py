from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Store, User, UserStore


class IdentityRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def by_email(self, email: str) -> User | None:
        return self.session.scalar(select(User).where(User.email == email))

    def user(self, user_id: UUID) -> User | None:
        return self.session.get(User, user_id)

    def linked(self, user_id: UUID, store_id: UUID) -> bool:
        return self.session.get(UserStore, (user_id, store_id)) is not None

    def stores(self, user: User) -> list[Store]:
        query = select(Store).order_by(Store.name, Store.id)
        if user.role != "ADMIN":
            query = query.join(UserStore).where(UserStore.user_id == user.id)
        return list(self.session.scalars(query))

    def store(self, store_id: UUID) -> Store | None:
        return self.session.get(Store, store_id)
