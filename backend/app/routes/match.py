from fastapi import APIRouter
from app.models.request_models import MatchRequest
from app.services.scoring_services import compute_interest_vector,compute_personality_vector

router = APIRouter()


@router.post("/match")
def match_user(data: MatchRequest):
    
    personality_vector = compute_personality_vector(data.personality_answers)
    interest_vector = compute_interest_vector(data.interest_answers)

    return {
        "name: ":data.name,
        "personality_vector: ":personality_vector,
        "interest_vector: ":interest_vector
    }