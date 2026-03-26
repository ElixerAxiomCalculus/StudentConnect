from fastapi import APIRouter
from app.services.matching_services import find_best_matches
from app.services.scoring_services import compute_interest_vector
from app.services.scoring_services import compute_personality_vector
from app.models.user_model import User

router = APIRouter()

@router.get("/test_match")
def test_match():

    
    sample_answers = [5,4, 3,4, 5,5, 2,3, 4,4, 5,5, 3,4, 2,5]
    computed_vector = compute_interest_vector(sample_answers)

        
    sample_personality_answers = [
        5,4,3,4,   # Trait 1
        4,4,5,3,   # Trait 2
        2,3,4,4,   # Trait 3
        5,5,4,4,   # Trait 4
        3,2,4,5,   # Trait 5
    ]

    computed_personality_vector = compute_personality_vector(sample_personality_answers)

    users = [

        User(
            name="Akshat",
            personality_answers=[],
            interest_answers=[],
            personality_vector=[0.8, 0.6, 0.4, 0.7, 0.3],
            interest_vector=[0.9, 0.2, 0.7, 0.3, 0.8, 0.4, 0.6, 0.5],
        ),

        User(
            name="Rohan",
            personality_answers=[],
            interest_answers=[],
            personality_vector=[0.7, 0.5, 0.5, 0.6, 0.4],
            interest_vector=[0.8, 0.3, 0.6, 0.4, 0.7, 0.5, 0.5, 0.6],
        ),

        User(
            name="Aman",
            personality_answers=[],
            interest_answers=[],
            personality_vector=[0.3, 0.8, 0.6, 0.2, 0.9],
            interest_vector=[0.2, 0.9, 0.3, 0.8, 0.1, 0.7, 0.4, 0.6],
        ),

        User(
            name="Priya",
            personality_answers=[],
            interest_answers=[],
            personality_vector=[0.75, 0.55, 0.45, 0.65, 0.35],
            interest_vector=[0.85, 0.25, 0.65, 0.35, 0.75, 0.45, 0.55, 0.65],
        ),

    ]

    current_user = users[0]
    best_matches = find_best_matches(current_user,users,top_n=3)

    # return {
    #     "current_user": current_user.name,
    #     "top_matches": best_matches
    # }

    return {
    "matches": best_matches
    }
