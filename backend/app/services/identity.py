from uuid import UUID

from app.core.errors import DomainError
from app.core.security import decode_token, dummy_hash, issue_token, verify_password
from app.models import Store, User
from app.repositories import IdentityRepository


class IdentityService:
    def __init__(self, repository: IdentityRepository, secret: str) -> None:
        self.repository, self.secret = repository, secret

    def login(self, email: str, password: str) -> tuple[str, User]:
        user = self.repository.by_email(email)
        valid = verify_password(password, user.password_hash if user else dummy_hash)
        if user is None or not valid or not user.is_active:
            raise DomainError(401, "UNAUTHORIZED", "Credenciais inválidas")
        return issue_token(user.id, user.role, self.secret), user

    def current_user(self, token: str) -> User:
        try:
            user_id = decode_token(token, self.secret)
        except ValueError:
            raise DomainError(401, "UNAUTHORIZED", "Sessão inválida") from None
        user = self.repository.user(user_id)
        if user is None or not user.is_active:
            raise DomainError(401, "UNAUTHORIZED", "Sessão inválida")
        return user

    def require_store_access(self, user: User, store_id: UUID) -> Store:
        if user.role != "ADMIN" and not self.repository.linked(user.id, store_id):
            raise DomainError(403, "FORBIDDEN", "Acesso não autorizado à loja")
        store = self.repository.store(store_id)
        if store is None:
            raise DomainError(404, "NOT_FOUND", "Loja não encontrada")
        return store
