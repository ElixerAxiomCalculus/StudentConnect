from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id, get_store
from app.models.schemas import GroupCreate, GroupInviteRequest
from app.services.group_service import create_group, invite_to_group, join_group, leave_group, list_groups

router = APIRouter(prefix='/api/groups', tags=['groups'])


@router.get('')
def get_groups(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    return list_groups(store, user_id)


@router.post('')
def post_group(
    payload: GroupCreate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    return create_group(store, user_id, payload.model_dump())


@router.post('/{group_id}/join')
def post_group_join(
    group_id: str,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    response = join_group(store, group_id, user_id)
    if response is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Group not found')
    return response


@router.post('/{group_id}/leave')
def post_group_leave(
    group_id: str,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    response = leave_group(store, group_id, user_id)
    if response is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Group not found')
    return response


@router.post('/{group_id}/invite')
def post_group_invite(
    group_id: str,
    payload: GroupInviteRequest,
    store=Depends(get_store),
):
    response = invite_to_group(store, group_id, payload.user_id)
    if response is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Group not found')
    return response
