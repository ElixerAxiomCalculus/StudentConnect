from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from uuid import uuid4


def now_iso() -> str:
    return (
        datetime.now(timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace('+00:00', 'Z')
    )


def new_id(prefix: str) -> str:
    return f'{prefix}{uuid4().hex[:8]}'


def get_user_map(store) -> dict[str, dict]:
    return {
        user['_id']: user
        for user in store.collection('users').list_documents()
    }


def get_user(store, user_id: str) -> dict | None:
    return store.collection('users').get_document(user_id)


def serialize_user_summary(user: dict) -> dict:
    return {
        'id': user['_id'],
        'name': user['name'],
        'major': user['major'],
        'year': user['year'],
        'avatar': user['avatar'],
        'online': user.get('online', False),
        'bio': user.get('bio', ''),
    }


def serialize_member(member: dict, user_map: dict[str, dict]) -> dict:
    user = user_map.get(member['id'], {})
    return {
        'id': member['id'],
        'name': user.get('name', member['id']),
        'role': member.get('role', 'member'),
    }


def calculate_project_progress(tasks: list[dict]) -> int:
    if not tasks:
        return 0
    completed = sum(1 for task in tasks if task.get('status') == 'done')
    return round((completed / len(tasks)) * 100)


def count_forum_replies(comments: list[dict]) -> int:
    count = 0
    for comment in comments:
        count += 1 + len(comment.get('replies', []))
    return count


def add_recent_activity(store, user_id: str, activity: dict) -> None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return
    dashboard = user.setdefault('dashboard', {})
    recent_activity = dashboard.setdefault('recent_activity', [])
    recent_activity.insert(0, deepcopy(activity))
    dashboard['recent_activity'] = recent_activity[:20]
    store.collection('users').save_document(user)


def add_feed_item(store, item: dict) -> dict:
    feed_collection = store.collection('feed_items')
    feed_collection.save_document(item)
    return item
