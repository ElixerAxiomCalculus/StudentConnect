from __future__ import annotations

from copy import deepcopy


def list_users(store) -> list[dict]:
    users = store.collection('users').list_documents()
    return [
        {
            'id': user['_id'],
            'name': user['name'],
            'major': user['major'],
            'year': user['year'],
            'avatar': user['avatar'],
            'online': user.get('online', False),
            'bio': user.get('bio', ''),
        }
        for user in users
    ]


def get_current_user(store, user_id: str) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None

    return {
        'id': user['_id'],
        'name': user['name'],
        'major': user['major'],
        'year': user['year'],
        'avatar': user['avatar'],
        'online': user.get('online', False),
        'bio': user.get('bio', ''),
        'email': user.get('email', ''),
        'semester': user.get('semester'),
        'interests': deepcopy(user.get('interests', [])),
    }


def update_current_user(store, user_id: str, payload: dict) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None

    for key in ['name', 'major', 'semester', 'bio', 'avatar', 'interests']:
        value = payload.get(key)
        if value is not None:
            user[key] = value

    store.collection('users').save_document(user)
    return get_current_user(store, user_id)


def get_notification_settings(store, user_id: str) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None
    return deepcopy(user.get('settings', {}).get('notifications', {}))


def update_notification_settings(store, user_id: str, payload: dict) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None

    notifications = user.setdefault('settings', {}).setdefault('notifications', {})
    for channel in ['email', 'push', 'inApp']:
        if payload.get(channel) is not None:
            notifications[channel] = payload[channel]

    store.collection('users').save_document(user)
    return deepcopy(notifications)


def get_privacy_settings(store, user_id: str) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None
    return deepcopy(user.get('settings', {}).get('privacy', {}))


def update_privacy_settings(store, user_id: str, payload: dict) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None

    privacy = user.setdefault('settings', {}).setdefault('privacy', {})
    for key in ['profile_visible', 'allow_messages_from_anyone', 'allow_project_invites']:
        if payload.get(key) is not None:
            privacy[key] = payload[key]

    store.collection('users').save_document(user)
    return deepcopy(privacy)


def get_accessibility_settings(store, user_id: str) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None
    return deepcopy(user.get('settings', {}).get('accessibility', {}))


def update_accessibility_settings(store, user_id: str, payload: dict) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None

    accessibility = user.setdefault('settings', {}).setdefault('accessibility', {})
    for key in ['reduced_motion', 'high_contrast', 'text_scale']:
        if payload.get(key) is not None:
            accessibility[key] = payload[key]

    store.collection('users').save_document(user)
    return deepcopy(accessibility)
