from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_user_id, get_store
from app.models.schemas import MatchActionRequest, MatchQuestionnaireUpdate
from app.services.match_service import (
    get_live_recommendations,
    get_match_summary,
    get_recommendations,
    record_action,
    update_questionnaire,
)

router = APIRouter(prefix='/api/matches', tags=['matches'])


@router.post('/questionnaire')
def save_match_questionnaire(
    payload: MatchQuestionnaireUpdate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    result = update_questionnaire(store, user_id, payload.model_dump())
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return result


@router.get('/recommendations')
def match_recommendations(
    limit: int = Query(default=10, ge=1, le=25),
    mode: str = Query(default='results'),
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    if mode == 'live':
        return get_live_recommendations(store, user_id, limit=limit)
    return get_recommendations(store, user_id, limit=limit)


@router.get('/results')
def match_results(
    limit: int = Query(default=6, ge=1, le=25),
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    return get_recommendations(store, user_id, limit=limit)


@router.post('/actions')
def match_action(
    payload: MatchActionRequest,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    result = record_action(store, user_id, payload.model_dump())
    if result is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid match action')
    return result


@router.get('/summary')
def match_summary(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    return get_match_summary(store, user_id)
