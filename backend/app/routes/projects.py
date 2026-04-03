from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id, get_store
from app.models.schemas import ProjectCreate, ProjectInviteRequest, ProjectJoinRequest, TaskCreate, TaskUpdate
from app.services.project_service import (
    add_task,
    create_project,
    delete_task,
    get_project,
    invite_to_project,
    list_projects,
    remove_member,
    request_join_project,
    update_task,
)

router = APIRouter(prefix='/api/projects', tags=['projects'])


@router.get('')
def get_projects(store=Depends(get_store)):
    return list_projects(store)


@router.get('/{project_id}')
def get_project_by_id(project_id: str, store=Depends(get_store)):
    project = get_project(store, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project not found')
    return project


@router.post('')
def post_project(
    payload: ProjectCreate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    return create_project(store, user_id, payload.model_dump())


@router.post('/join')
def post_project_join(
    payload: ProjectJoinRequest,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    project = request_join_project(store, payload.project_id, user_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project not found')
    return project


@router.post('/{project_id}/invite')
def post_project_invite(
    project_id: str,
    payload: ProjectInviteRequest,
    store=Depends(get_store),
):
    project = invite_to_project(store, project_id, payload.model_dump(exclude_none=True))
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project not found')
    return project


@router.post('/{project_id}/tasks')
def post_task(
    project_id: str,
    payload: TaskCreate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    project = add_task(store, project_id, user_id, payload.model_dump())
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project not found')
    return project


@router.patch('/{project_id}/tasks/{task_id}')
def patch_task(
    project_id: str,
    task_id: str,
    payload: TaskUpdate,
    store=Depends(get_store),
):
    project = update_task(store, project_id, task_id, payload.model_dump(exclude_none=True))
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Task not found')
    return project


@router.delete('/{project_id}/tasks/{task_id}')
def remove_task(
    project_id: str,
    task_id: str,
    store=Depends(get_store),
):
    project = delete_task(store, project_id, task_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Task not found')
    return project


@router.delete('/{project_id}/members/{member_id}')
def delete_project_member(
    project_id: str,
    member_id: str,
    store=Depends(get_store),
):
    project = remove_member(store, project_id, member_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Project not found')
    return project
