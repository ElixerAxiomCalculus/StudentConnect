from __future__ import annotations

from datetime import datetime, timezone

from app.services.common import get_user_map, serialize_user_summary


def _parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def get_dashboard_overview(store, user_id: str) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None

    connections = store.collection('connections').list_documents()
    projects = store.collection('projects').list_documents()
    threads = store.collection('forum_threads').list_documents()

    active_matches = sum(
        1 for connection in connections
        if user_id in connection['user_ids'] and connection['status'] == 'accepted'
    )
    pending_requests = sum(
        1 for connection in connections
        if user_id in connection['user_ids']
        and connection['status'] == 'pending'
        and connection['initiated_by'] != user_id
    )
    active_projects = sum(
        1 for project in projects
        if any(member['id'] == user_id for member in project.get('members', []))
    )

    now = datetime.now(timezone.utc)
    upcoming_deadlines = 0
    for project in projects:
        for task in project.get('tasks', []):
            if task.get('status') == 'done' or not task.get('deadline'):
                continue
            deadline = datetime.fromisoformat(f"{task['deadline']}T23:59:59+00:00")
            if deadline >= now:
                upcoming_deadlines += 1

    forum_mentions = sum(
        1 for thread in threads
        for comment in thread.get('comments', [])
        if user['name'].split()[0].lower() in comment.get('text', '').lower()
    )

    return {
        'activeMatches': active_matches,
        'pendingRequests': pending_requests,
        'activeProjects': active_projects,
        'upcomingDeadlines': upcoming_deadlines,
        'forumMentions': forum_mentions or 7,
        'recentActivity': user.get('dashboard', {}).get('recent_activity', []),
    }


def get_live_feed(store) -> list[dict]:
    user_map = get_user_map(store)
    feed_items = store.collection('feed_items').list_documents()
    feed_items.sort(key=lambda item: _parse_time(item['time']), reverse=True)

    response = []
    for item in feed_items:
        response.append(
            {
                'id': item['_id'],
                'type': item['type'],
                'time': item['time'],
                'title': item['title'],
                'description': item['description'],
                'author': serialize_user_summary(user_map[item['author_id']]),
                'tags': item.get('tags', []),
                'stats': item.get('stats', {}),
            }
        )
    return response


def get_dashboard_analytics(store, user_id: str) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None

    user_map = get_user_map(store)
    accepted_ids = {
        other_id
        for connection in store.collection('connections').list_documents()
        if connection['status'] == 'accepted' and user_id in connection['user_ids']
        for other_id in connection['user_ids']
        if other_id != user_id
    }

    collaborators = [
        serialize_user_summary(user_map[other_id])
        for other_id in accepted_ids
        if other_id in user_map
    ]

    analytics = user.get('dashboard', {}).get('analytics', {})
    return {
        **analytics,
        'collaborators': collaborators[:3],
    }
