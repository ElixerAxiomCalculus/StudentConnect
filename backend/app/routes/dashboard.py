from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id, get_store
from app.services.dashboard_service import get_dashboard_analytics, get_dashboard_overview, get_live_feed

router = APIRouter(prefix='/api/dashboard', tags=['dashboard'])


@router.get('/overview')
def dashboard_overview(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    overview = get_dashboard_overview(store, user_id)
    if overview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return overview


@router.get('/feed')
def dashboard_feed(store=Depends(get_store)):
    return get_live_feed(store)


@router.get('/analytics')
def dashboard_analytics(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    analytics = get_dashboard_analytics(store, user_id)
    if analytics is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return analytics
