from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.chat_manager import ChatConnectionManager
from app.core.config import get_settings
from app.core.datastore import InMemoryStore, MongoStore
from app.core.seed_data import get_seed_collections, seed_store
from app.routes.auth import router as auth_router
from app.routes.chat import router as chat_router, ws_router as chat_ws_router
from app.routes.connections import router as connections_router
from app.routes.dashboard import router as dashboard_router
from app.routes.forums import router as forums_router
from app.routes.groups import router as groups_router
from app.routes.health import router as health_router
from app.routes.matches import router as matches_router
from app.routes.projects import router as projects_router
from app.routes.questionnaire import router as questionnaire_router
from app.routes.settings import router as settings_router
from app.routes.users import router as users_router

settings = get_settings()


def _build_store():
    if settings.use_in_memory_db:
        return InMemoryStore(get_seed_collections())
    return MongoStore(settings.mongo_url, settings.mongo_db_name)


@asynccontextmanager
async def lifespan(app: FastAPI):
    store = _build_store()
    # Only seed mock data for in-memory dev mode, never for MongoDB
    if settings.use_in_memory_db:
        seed_store(store)
    app.state.store = store
    app.state.chat_manager = ChatConnectionManager()
    yield
    store.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(connections_router)
app.include_router(settings_router)
app.include_router(dashboard_router)
app.include_router(matches_router)
app.include_router(questionnaire_router)
app.include_router(chat_router)
app.include_router(chat_ws_router)
app.include_router(forums_router)
app.include_router(groups_router)
app.include_router(projects_router)
