from __future__ import annotations

import hashlib
import secrets
import time
from datetime import datetime, timezone, timedelta

import bcrypt
import jwt

from app.core.config import get_settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    if not hashed:
        return False
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(user_id: str, email: str) -> str:
    settings = get_settings()
    payload = {
        'sub': user_id,
        'email': email,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm='HS256')


def decode_access_token(token: str) -> str | None:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=['HS256'])
        return payload.get('sub')
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def generate_user_id() -> str:
    return 'u_' + secrets.token_hex(8)


def generate_otp() -> str:
    return f'{secrets.randbelow(1000000):06d}'


def register_user(store, name: str, email: str, password: str) -> dict | None:
    users_col = store.collection('users')

    # Check if email already exists
    existing = users_col.find_by_field('email', email)
    if existing:
        return None  # email taken

    user_id = generate_user_id()
    avatar_seed = name.replace(' ', '')
    user_doc = {
        '_id': user_id,
        'name': name,
        'email': email,
        'password_hash': hash_password(password),
        'email_verified': False,
        'major': '',
        'year': '',
        'semester': None,
        'bio': '',
        'avatar': f'https://api.dicebear.com/7.x/avataaars/svg?seed={avatar_seed}',
        'online': False,
        'interests': [],
        'personality_vector': [],
        'interest_vector': [],
        'settings': {
            'notifications': {'email': {'messages': True, 'projects': True, 'forums': True}, 'push': {'messages': True, 'projects': True}, 'inApp': {'messages': True, 'projects': True, 'forums': True}},
            'privacy': {'profile_visible': True, 'allow_messages_from_anyone': True, 'allow_project_invites': True},
            'accessibility': {'reduced_motion': False, 'high_contrast': False, 'text_scale': 100},
        },
        'dashboard': {'recent_activity': [], 'analytics': {'study_hours': [], 'projects_completed': 0, 'tasks_done': 0}},
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    users_col.save_document(user_doc)
    return user_doc


def authenticate_user(store, email: str, password: str) -> dict | None:
    user = store.collection('users').find_by_field('email', email)
    if not user:
        return None
    if not verify_password(password, user.get('password_hash', '')):
        return None
    return user


def store_otp(store, email: str, otp: str) -> None:
    otp_col = store.collection('otp_codes')
    doc = {
        '_id': f'otp_{email}',
        'email': email,
        'otp': otp,
        'expires_at': (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    otp_col.save_document(doc)


def verify_otp(store, email: str, otp: str) -> bool:
    otp_col = store.collection('otp_codes')
    doc = otp_col.get_document(f'otp_{email}')
    if not doc:
        return False

    if doc['otp'] != otp:
        return False

    expires_at = datetime.fromisoformat(doc['expires_at'].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        return False

    # OTP is valid — delete it so it can't be reused
    otp_col.delete_document(f'otp_{email}')
    return True


def mark_email_verified(store, email: str) -> dict | None:
    user = store.collection('users').find_by_field('email', email)
    if not user:
        return None
    user['email_verified'] = True
    store.collection('users').save_document(user)
    return user
