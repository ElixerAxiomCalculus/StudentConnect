from pydantic import BaseModel
from typing import List

class MatchRequest(BaseModel):
    name: str
    personality_answers: List[int]
    interest_answers: List[int]