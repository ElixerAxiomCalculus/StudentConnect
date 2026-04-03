from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id, get_store
from app.models.schemas import (
    AccessibilitySettingsUpdate,
    NotificationSettingsUpdate,
    PrivacySettingsUpdate,
)
from app.services.user_service import (
    get_accessibility_settings,
    get_notification_settings,
    get_privacy_settings,
    update_accessibility_settings,
    update_notification_settings,
    update_privacy_settings,
)

router = APIRouter(prefix='/api/settings', tags=['settings'])


@router.get('/notifications')
def fetch_notification_settings(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    settings = get_notification_settings(store, user_id)
    if settings is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return settings


@router.put('/notifications')
def save_notification_settings(
    payload: NotificationSettingsUpdate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    settings = update_notification_settings(store, user_id, payload.model_dump(exclude_none=True))
    if settings is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return settings


@router.get('/privacy')
def fetch_privacy_settings(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    settings = get_privacy_settings(store, user_id)
    if settings is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return settings


@router.put('/privacy')
def save_privacy_settings(
    payload: PrivacySettingsUpdate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    settings = update_privacy_settings(store, user_id, payload.model_dump(exclude_none=True))
    if settings is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return settings


@router.get('/accessibility')
def fetch_accessibility_settings(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    settings = get_accessibility_settings(store, user_id)
    if settings is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return settings


@router.put('/accessibility')
def save_accessibility_settings(
    payload: AccessibilitySettingsUpdate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    settings = update_accessibility_settings(store, user_id, payload.model_dump(exclude_none=True))
    if settings is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return settings
