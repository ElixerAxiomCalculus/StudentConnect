from typing import Annotated

from fastapi import Header
from starlette.requests import HTTPConnection

from app.core.config import get_settings


def get_store(request: HTTPConnection):
    return request.app.state.store


def get_chat_manager(request: HTTPConnection):
    return request.app.state.chat_manager


def get_current_user_id(
    x_user_id: Annotated[str | None, Header(alias='X-User-Id')] = None,
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    if authorization and authorization.startswith('Bearer '):
        token = authorization[7:]
        from app.services.auth_service import decode_access_token
        user_id = decode_access_token(token)
        if user_id:
            return user_id

    if x_user_id:
        return x_user_id

    settings = get_settings()
    return settings.demo_user_id
