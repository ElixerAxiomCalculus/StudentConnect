from fastapi import FastAPI
from app.routes.health import router as health_router
from app.routes.test_match import router as test_match_router
from app.routes.match import router as match_router
from fastapi.middleware.cors import CORSMiddleware


app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(test_match_router)
app.include_router(match_router)