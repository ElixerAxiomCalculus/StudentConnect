from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
import os


def _load_env_file() -> None:
    env_path = Path(__file__).resolve().parents[2] / '.env'
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        os.environ.setdefault(key.strip(), value.strip())


def _parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


def _parse_csv(value: str | None, default: list[str] | None = None) -> list[str]:
    if not value:
        return list(default or [])
    return [item.strip() for item in value.split(',') if item.strip()]


_load_env_file()


@dataclass(frozen=True)
class Settings:
    app_name: str
    use_in_memory_db: bool
    mongo_url: str
    mongo_db_name: str
    demo_user_id: str
    frontend_origins: list[str]
    jwt_secret: str
    resend_api_key: str


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        app_name=os.getenv('APP_NAME', 'StudentConnect API'),
        use_in_memory_db=_parse_bool(os.getenv('USE_IN_MEMORY_DB'), default=True),
        mongo_url=os.getenv('MONGO_URL', 'mongodb://localhost:27017'),
        mongo_db_name=os.getenv('MONGO_DB_NAME', 'studentconnect'),
        demo_user_id=os.getenv('DEMO_USER_ID', 'u0'),
        frontend_origins=_parse_csv(
            os.getenv('FRONTEND_ORIGINS'),
            default=['http://localhost:5173', 'http://127.0.0.1:5173'],
        ),
        jwt_secret=os.getenv('JWT_SECRET', 'change-me-in-production'),
        resend_api_key=os.getenv('RESEND_OTP', ''),
    )
