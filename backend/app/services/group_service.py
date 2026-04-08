from __future__ import annotations

from app.services.common import add_feed_item, get_user_map, new_id, now_iso


def _serialize_group(group: dict, user_id: str) -> dict:
    members = group.get('members', [])
    member_ids = [m['id'] for m in members]
    return {
        'id': group['_id'],
        'name': group['name'],
        'description': group.get('description', ''),
        'members': len(members),
        'memberIds': member_ids,
        'invited': user_id in group.get('invitee_ids', []),
        'joined': user_id in member_ids,
        'visibility': group.get('visibility', 'public'),
        'tags': group.get('tags', []),
        'category': group.get('category', 'study'),
        'ownerId': group.get('owner_id', ''),
        'threadId': group.get('thread_id', ''),
    }


def _ensure_group_thread(store, group: dict) -> dict:
    """Create a chat thread for a group that doesn't have one yet."""
    if group.get('thread_id'):
        return group

    member_ids = [m['id'] for m in group.get('members', [])]
    now = now_iso()
    thread = {
        '_id': new_id('t'),
        'type': 'group',
        'participant_ids': member_ids,
        'group_id': group['_id'],
        'title': group.get('name', ''),
        'avatar': '',
        'unread_counts': {uid: 0 for uid in member_ids},
        'pinned_by': [],
        'muted_by': [],
        'archived_by': [],
        'last_message_preview': '',
        'last_message_at': now,
    }
    store.collection('chat_threads').save_document(thread)
    group['thread_id'] = thread['_id']
    store.collection('groups').save_document(group)
    return group


def list_groups(store, user_id: str) -> list[dict]:
    groups = store.collection('groups').list_documents()
    result = []
    for group in groups:
        group = _ensure_group_thread(store, group)
        result.append(_serialize_group(group, user_id))
    return result


def create_group(store, user_id: str, payload: dict) -> dict:
    now = now_iso()
    group_id = new_id('g')

    # Create a chat thread for the group
    thread = {
        '_id': new_id('t'),
        'type': 'group',
        'participant_ids': [user_id],
        'group_id': group_id,
        'title': payload['name'],
        'avatar': '',
        'unread_counts': {user_id: 0},
        'pinned_by': [],
        'muted_by': [],
        'archived_by': [],
        'last_message_preview': '',
        'last_message_at': now,
    }
    store.collection('chat_threads').save_document(thread)

    group = {
        '_id': group_id,
        'name': payload['name'],
        'description': payload.get('description', ''),
        'category': payload.get('category', 'study'),
        'visibility': payload.get('visibility', 'public'),
        'tags': payload.get('tags', []),
        'owner_id': user_id,
        'members': [{'id': user_id, 'role': 'owner'}],
        'invitee_ids': [],
        'request_ids': [],
        'thread_id': thread['_id'],
    }
    store.collection('groups').save_document(group)
    add_feed_item(
        store,
        {
            '_id': new_id('lf'),
            'type': 'group',
            'time': now,
            'title': group['name'],
            'description': group['description'],
            'author_id': user_id,
            'tags': group['tags'],
            'stats': {'members': 1},
            'target_id': group['_id'],
        },
    )
    return _serialize_group(group, user_id)


def join_group(store, group_id: str, user_id: str) -> dict | None:
    group = store.collection('groups').get_document(group_id)
    if not group:
        return None
    if not any(member['id'] == user_id for member in group.get('members', [])):
        group.setdefault('members', []).append({'id': user_id, 'role': 'member'})
        store.collection('groups').save_document(group)

        # Also add user to the group's chat thread
        thread_id = group.get('thread_id')
        if thread_id:
            thread = store.collection('chat_threads').get_document(thread_id)
            if thread and user_id not in thread.get('participant_ids', []):
                thread['participant_ids'].append(user_id)
                thread.setdefault('unread_counts', {})[user_id] = 0
                store.collection('chat_threads').save_document(thread)

    return list_groups(store, user_id=user_id)


def leave_group(store, group_id: str, user_id: str) -> dict | None:
    group = store.collection('groups').get_document(group_id)
    if not group:
        return None
    group['members'] = [member for member in group.get('members', []) if member['id'] != user_id]
    store.collection('groups').save_document(group)
    return {
        'id': group['_id'],
        'name': group['name'],
        'members': len(group['members']),
    }


def invite_to_group(store, group_id: str, user_id: str) -> dict | None:
    group = store.collection('groups').get_document(group_id)
    if not group:
        return None
    invitee_ids = set(group.get('invitee_ids', []))
    invitee_ids.add(user_id)
    group['invitee_ids'] = list(invitee_ids)
    store.collection('groups').save_document(group)
    return {
        'id': group['_id'],
        'inviteeIds': group['invitee_ids'],
    }
