from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_user_id, get_store
from app.models.schemas import UserProfileUpdate
from app.services.connection_service import search_users
from app.services.user_service import delete_user_account, get_current_user, list_users, update_current_user

router = APIRouter(prefix='/api', tags=['users'])


@router.get('/users')
def get_users(store=Depends(get_store)):
    return list_users(store)


@router.get('/users/search')
def search(
    q: str = Query(default='', min_length=0),
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    if not q.strip():
        return []
    return search_users(store, q, user_id)


@router.get('/me')
def get_me(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    profile = get_current_user(store, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return profile


@router.put('/me')
def update_me(
    payload: UserProfileUpdate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    profile = update_current_user(store, user_id, payload.model_dump(exclude_none=True))
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return profile


@router.delete('/me', status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    deleted = delete_user_account(store, user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
