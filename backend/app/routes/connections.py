from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.core.dependencies import get_current_user_id, get_store
from app.services.connection_service import (
    accept_connection,
    decline_connection,
    list_connections,
    search_users,
    send_connection_request,
)

router = APIRouter(prefix='/api/connections', tags=['connections'])


class ConnectionRequest(BaseModel):
    target_user_id: str


@router.get('')
def get_connections(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    return list_connections(store, user_id)


@router.post('/request')
def post_connection_request(
    payload: ConnectionRequest,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    result = send_connection_request(store, user_id, payload.target_user_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid request')
    return result


@router.post('/{connection_id}/accept')
def post_accept_connection(
    connection_id: str,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    result = accept_connection(store, connection_id, user_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Connection not found')
    return result


@router.post('/{connection_id}/decline')
def post_decline_connection(
    connection_id: str,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    result = decline_connection(store, connection_id, user_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Connection not found')
    return result


@router.get('/search')
def get_search_users(
    q: str = Query(default='', min_length=0),
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    if not q.strip():
        return []
    return search_users(store, q, user_id)
