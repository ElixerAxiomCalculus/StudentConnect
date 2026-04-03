from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id, get_store
from app.models.schemas import UserProfileUpdate
from app.services.user_service import get_current_user, list_users, update_current_user

router = APIRouter(prefix='/api', tags=['users'])


@router.get('/users')
def get_users(store=Depends(get_store)):
    return list_users(store)


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
