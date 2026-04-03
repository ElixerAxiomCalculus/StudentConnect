from __future__ import annotations

from app.services.common import add_feed_item, get_user_map, new_id, now_iso


def list_groups(store, user_id: str) -> list[dict]:
    groups = store.collection('groups').list_documents()
    return [
        {
            'id': group['_id'],
            'name': group['name'],
            'description': group.get('description', ''),
            'members': len(group.get('members', [])),
            'invited': user_id in group.get('invitee_ids', []),
            'joined': any(member['id'] == user_id for member in group.get('members', [])),
            'visibility': group.get('visibility', 'public'),
            'tags': group.get('tags', []),
            'category': group.get('category', 'study'),
        }
        for group in groups
    ]


def create_group(store, user_id: str, payload: dict) -> dict:
    now = now_iso()
    group = {
        '_id': new_id('g'),
        'name': payload['name'],
        'description': payload.get('description', ''),
        'category': payload.get('category', 'study'),
        'visibility': payload.get('visibility', 'public'),
        'tags': payload.get('tags', []),
        'owner_id': user_id,
        'members': [{'id': user_id, 'role': 'owner'}],
        'invitee_ids': [],
        'request_ids': [],
        'thread_id': '',
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
    return {
        'id': group['_id'],
        'name': group['name'],
        'description': group['description'],
        'members': 1,
        'invited': False,
        'joined': True,
        'visibility': group['visibility'],
        'tags': group['tags'],
        'category': group['category'],
    }


def join_group(store, group_id: str, user_id: str) -> dict | None:
    group = store.collection('groups').get_document(group_id)
    if not group:
        return None
    if not any(member['id'] == user_id for member in group.get('members', [])):
        group.setdefault('members', []).append({'id': user_id, 'role': 'member'})
        store.collection('groups').save_document(group)
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
