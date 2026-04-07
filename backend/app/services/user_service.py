from __future__ import annotations

from copy import deepcopy


def list_users(store) -> list[dict]:
    users = store.collection('users').list_documents()
    return [
        {
            'id': user['_id'],
            'name': user['name'],
            'major': user.get('major', ''),
            'year': user.get('year', 1),
            'avatar': user['avatar'],
            'online': user.get('online', False),
            'bio': user.get('bio', ''),
            'interests': deepcopy(user.get('interests', [])),
            'skills_offer': deepcopy(user.get('skills_offer', [])),
            'goals': deepcopy(user.get('goals', [])),
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
        'email': user.get('email', ''),
        'major': user.get('major', ''),
        'year': user.get('year', 1),
        'year_label': user.get('year_label', ''),
        'semester': user.get('semester'),
        'college': user.get('college', ''),
        'department': user.get('department', ''),
        'bio': user.get('bio', ''),
        'github': user.get('github', ''),
        'linkedin': user.get('linkedin', ''),
        'avatar': user['avatar'],
        'online': user.get('online', False),
        'interests': deepcopy(user.get('interests', [])),
        'skills_offer': deepcopy(user.get('skills_offer', [])),
        'skills_seek': deepcopy(user.get('skills_seek', [])),
        'goals': deepcopy(user.get('goals', [])),
        'availability_days': deepcopy(user.get('availability_days', [])),
        'availability_hours': deepcopy(user.get('availability_hours', [])),
        'project_tags': deepcopy(user.get('project_tags', [])),
        'team_size': user.get('team_size', '3–4'),
        'weekly_commitment': user.get('weekly_commitment', ''),
        'match_type': user.get('match_type', 'Complementary Skills'),
        'questionnaire_completed': user.get('questionnaire_completed', True),
    }


def update_current_user(store, user_id: str, payload: dict) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None

    updatable_fields = [
        'name', 'major', 'semester', 'bio', 'avatar', 'interests',
        'github', 'linkedin', 'college', 'department',
        'skills_offer', 'skills_seek', 'goals',
        'availability_days', 'availability_hours', 'project_tags',
        'team_size', 'weekly_commitment', 'match_type',
    ]
    for key in updatable_fields:
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
