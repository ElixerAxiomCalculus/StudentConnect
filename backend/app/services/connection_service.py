from __future__ import annotations

from app.services.common import get_user_map, new_id, now_iso


def list_connections(store, user_id: str) -> dict:
    connections = store.collection('connections').list_documents()
    user_map = get_user_map(store)

    friends = []
    pending_received = []
    pending_sent = []

    for conn in connections:
        if user_id not in conn.get('user_ids', []):
            continue
        other_id = next(uid for uid in conn['user_ids'] if uid != user_id)
        other_user = user_map.get(other_id)
        if not other_user:
            continue

        entry = {
            'connectionId': conn['_id'],
            'userId': other_id,
            'name': other_user['name'],
            'avatar': other_user['avatar'],
            'major': other_user.get('major', ''),
            'year': other_user.get('year', 1),
            'bio': other_user.get('bio', ''),
            'online': other_user.get('online', False),
            'status': conn['status'],
        }

        if conn['status'] == 'accepted':
            friends.append(entry)
        elif conn['status'] == 'pending':
            if conn.get('initiated_by') == user_id:
                pending_sent.append(entry)
            else:
                pending_received.append(entry)

    return {
        'friends': friends,
        'pendingReceived': pending_received,
        'pendingSent': pending_sent,
    }


def send_connection_request(store, user_id: str, target_user_id: str) -> dict | None:
    if user_id == target_user_id:
        return None

    target_user = store.collection('users').get_document(target_user_id)
    if not target_user:
        return None

    collection = store.collection('connections')
    for conn in collection.list_documents():
        if sorted(conn['user_ids']) == sorted([user_id, target_user_id]):
            if conn['status'] in ('accepted', 'pending'):
                return conn
            break

    now = now_iso()
    connection = {
        '_id': new_id('conn'),
        'user_ids': sorted([user_id, target_user_id]),
        'status': 'pending',
        'initiated_by': user_id,
        'updated_at': now,
    }
    collection.save_document(connection)
    return connection


def accept_connection(store, connection_id: str, user_id: str) -> dict | None:
    collection = store.collection('connections')
    conn = collection.get_document(connection_id)
    if not conn or user_id not in conn.get('user_ids', []):
        return None
    if conn.get('initiated_by') == user_id:
        return None

    conn['status'] = 'accepted'
    conn['updated_at'] = now_iso()
    collection.save_document(conn)
    return conn


def decline_connection(store, connection_id: str, user_id: str) -> dict | None:
    collection = store.collection('connections')
    conn = collection.get_document(connection_id)
    if not conn or user_id not in conn.get('user_ids', []):
        return None

    conn['status'] = 'declined'
    conn['updated_at'] = now_iso()
    collection.save_document(conn)
    return conn


def search_users(store, query: str, current_user_id: str) -> list[dict]:
    users = store.collection('users').list_documents()
    query_lower = query.lower().strip()
    results = []
    for user in users:
        if user['_id'] == current_user_id:
            continue
        name = user.get('name', '').lower()
        major = user.get('major', '').lower()
        if query_lower in name or query_lower in major:
            results.append({
                'id': user['_id'],
                'name': user['name'],
                'avatar': user['avatar'],
                'major': user.get('major', ''),
                'year': user.get('year', 1),
                'bio': user.get('bio', ''),
                'online': user.get('online', False),
            })
    return results[:20]
