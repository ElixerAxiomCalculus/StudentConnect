from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {"Message":"backend is healthy"}