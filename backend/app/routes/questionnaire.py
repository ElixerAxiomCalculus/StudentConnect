from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id, get_store
from app.models.schemas import QuestionnaireSubmit
from app.services.questionnaire_service import submit_questionnaire

router = APIRouter(prefix='/api/questionnaire', tags=['questionnaire'])


@router.post('')
def submit(
    payload: QuestionnaireSubmit,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    result = submit_questionnaire(store, user_id, payload)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return result


@router.get('/status')
def questionnaire_status(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    user = store.collection('users').get_document(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return {'questionnaire_completed': user.get('questionnaire_completed', False)}
