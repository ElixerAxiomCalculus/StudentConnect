from __future__ import annotations

from copy import deepcopy

from app.services.common import add_recent_activity, get_user_map, new_id, now_iso


def _serialize_message(message: dict) -> dict:
    return {
        'id': message['_id'],
        'threadId': message.get('thread_id', ''),
        'senderId': message.get('sender_id', ''),
        'text': message.get('text', ''),
        'time': message.get('time', ''),
        'status': message.get('status', 'delivered'),
        'attachments': message.get('attachments', []),
        'edited': message.get('edited', False),
    }


def _sort_messages(messages: list[dict]) -> list[dict]:
    return sorted(messages, key=lambda message: message['time'])


def _build_thread_name(thread: dict, user_id: str, user_map: dict[str, dict], projects: dict[str, dict], groups: dict[str, dict]) -> tuple[str, str, bool]:
    if thread['type'] in {'personal', 'request'}:
        other_user_id = next((p for p in thread['participant_ids'] if p != user_id), None)
        other_user = user_map.get(other_user_id) if other_user_id else None
        if other_user:
            return other_user['name'], other_user['avatar'], other_user.get('online', False)
        return 'Deleted User', '', False

    if thread['type'] == 'project' and thread.get('project_id') in projects:
        project = projects[thread['project_id']]
        owner = user_map.get(project['owner_id'])
        fallback_avatar = owner['avatar'] if owner else ''
        return thread.get('title') or f"Group: {project['title']}", thread.get('avatar') or fallback_avatar, False

    if thread['type'] == 'group' and thread.get('group_id') in groups:
        group = groups[thread['group_id']]
        owner = user_map.get(group['owner_id'])
        fallback_avatar = owner['avatar'] if owner else ''
        return thread.get('title') or group['name'], thread.get('avatar') or fallback_avatar, False

    return thread.get('title', 'Conversation'), thread.get('avatar', ''), False


def list_threads(store, user_id: str) -> list[dict]:
    user_map = get_user_map(store)
    projects = {project['_id']: project for project in store.collection('projects').list_documents()}
    groups = {group['_id']: group for group in store.collection('groups').list_documents()}
    threads = [
        thread
        for thread in store.collection('chat_threads').list_documents()
        if user_id in thread.get('participant_ids', [])
    ]
    threads.sort(key=lambda thread: thread.get('last_message_at', ''), reverse=True)

    response = []
    for thread in threads:
        name, avatar, online = _build_thread_name(thread, user_id, user_map, projects, groups)
        response.append(
            {
                'threadId': thread['_id'],
                'name': name,
                'avatar': avatar,
                'lastMessage': thread.get('last_message_preview', ''),
                'unread': thread.get('unread_counts', {}).get(user_id, 0),
                'lastTime': thread.get('last_message_at', now_iso()),
                'type': thread['type'],
                'online': online,
            }
        )
    return response


def create_thread(store, user_id: str, payload: dict) -> dict:
    participant_ids = sorted(set([user_id, *payload.get('participant_ids', [])]))
    thread = {
        '_id': new_id('t'),
        'type': payload.get('type', 'personal'),
        'participant_ids': participant_ids,
        'project_id': payload.get('project_id'),
        'group_id': payload.get('group_id'),
        'title': payload.get('title', ''),
        'avatar': '',
        'unread_counts': {participant_id: 0 for participant_id in participant_ids},
        'pinned_by': [],
        'muted_by': [],
        'archived_by': [],
        'last_message_preview': '',
        'last_message_at': now_iso(),
    }
    store.collection('chat_threads').save_document(thread)
    return thread


def update_thread_preferences(store, thread_id: str, user_id: str, payload: dict) -> dict | None:
    thread = store.collection('chat_threads').get_document(thread_id)
    if not thread or user_id not in thread.get('participant_ids', []):
        return None

    for field, key in [('pinned', 'pinned_by'), ('muted', 'muted_by'), ('archived', 'archived_by')]:
        if payload.get(field) is None:
            continue
        values = set(thread.get(key, []))
        if payload[field]:
            values.add(user_id)
        else:
            values.discard(user_id)
        thread[key] = list(values)

    store.collection('chat_threads').save_document(thread)
    return thread


def get_messages(store, thread_id: str, user_id: str) -> list[dict] | None:
    thread = store.collection('chat_threads').get_document(thread_id)
    if not thread or user_id not in thread.get('participant_ids', []):
        return None
    messages = [
        message
        for message in store.collection('chat_messages').list_documents()
        if message['thread_id'] == thread_id
    ]
    return [_serialize_message(m) for m in _sort_messages(messages)]


def send_message(store, thread_id: str, user_id: str, payload: dict) -> dict | None:
    thread = store.collection('chat_threads').get_document(thread_id)
    if not thread or user_id not in thread.get('participant_ids', []):
        return None

    message = {
        '_id': new_id('m'),
        'thread_id': thread_id,
        'sender_id': user_id,
        'text': payload.get('text', ''),
        'time': now_iso(),
        'status': 'delivered',
        'attachments': payload.get('attachments', []),
        'edited': False,
    }
    store.collection('chat_messages').save_document(message)

    thread['last_message_preview'] = message['text'] or 'Attachment'
    thread['last_message_at'] = message['time']
    unread_counts = thread.setdefault('unread_counts', {})
    for participant_id in thread.get('participant_ids', []):
        unread_counts[participant_id] = 0 if participant_id == user_id else unread_counts.get(participant_id, 0) + 1
        if participant_id != user_id:
            add_recent_activity(
                store,
                participant_id,
                {
                    'id': new_id('a'),
                    'type': 'message',
                    'text': 'New chat activity',
                    'time': message['time'],
                    'icon': 'message',
                },
            )
    thread['unread_counts'] = unread_counts
    store.collection('chat_threads').save_document(thread)
    return _serialize_message(message)


def find_or_create_dm_thread(store, user_id: str, target_user_id: str) -> dict:
    """Find existing DM thread between two users, or create one."""
    pair = sorted([user_id, target_user_id])
    for thread in store.collection('chat_threads').list_documents():
        if thread['type'] == 'personal' and sorted(thread.get('participant_ids', [])) == pair:
            user_map = get_user_map(store)
            projects = {p['_id']: p for p in store.collection('projects').list_documents()}
            groups = {g['_id']: g for g in store.collection('groups').list_documents()}
            name, avatar, online = _build_thread_name(thread, user_id, user_map, projects, groups)
            return {
                'threadId': thread['_id'],
                'name': name,
                'avatar': avatar,
                'lastMessage': thread.get('last_message_preview', ''),
                'unread': thread.get('unread_counts', {}).get(user_id, 0),
                'lastTime': thread.get('last_message_at', now_iso()),
                'type': thread['type'],
                'online': online,
            }

    payload = {'participant_ids': [target_user_id], 'type': 'personal'}
    thread = create_thread(store, user_id, payload)
    user_map = get_user_map(store)
    other_user = user_map.get(target_user_id, {})
    return {
        'threadId': thread['_id'],
        'name': other_user.get('name', 'Unknown'),
        'avatar': other_user.get('avatar', ''),
        'lastMessage': '',
        'unread': 0,
        'lastTime': thread.get('last_message_at', now_iso()),
        'type': 'personal',
        'online': other_user.get('online', False),
    }


def mark_thread_read(store, thread_id: str, user_id: str) -> dict | None:
    thread = store.collection('chat_threads').get_document(thread_id)
    if not thread or user_id not in thread.get('participant_ids', []):
        return None
    unread_counts = thread.setdefault('unread_counts', {})
    unread_counts[user_id] = 0
    thread['unread_counts'] = unread_counts
    store.collection('chat_threads').save_document(thread)
    return thread
