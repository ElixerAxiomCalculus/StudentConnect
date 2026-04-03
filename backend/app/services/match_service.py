from __future__ import annotations

from app.services.common import get_user_map, new_id, now_iso
from app.services.scoring_services import compute_interest_vector, compute_personality_vector
from app.utils.vector_utils import cosine_similarity

INTEREST_LABELS = [
    'Technology',
    'Academics',
    'Sports',
    'Arts',
    'Social Activities',
    'Gaming',
    'Leadership',
    'Adventure',
]


def _match_percentage(current_user: dict, other_user: dict) -> tuple[float, list[str]]:
    p1 = current_user.get('personality_vector', [])
    p2 = other_user.get('personality_vector', [])
    i1 = current_user.get('interest_vector', [])
    i2 = other_user.get('interest_vector', [])

    if not p1 or not i1 or len(p1) != len(p2) or len(i1) != len(i2):
        return 0.0, []

    personality_similarity = cosine_similarity(p1, p2)
    interest_similarity = cosine_similarity(i1, i2)
    final_score = (0.55 * interest_similarity) + (0.45 * personality_similarity)

    common_interests = [
        label for index, label in enumerate(INTEREST_LABELS)
        if i1[index] > 0.6 and i2[index] > 0.6
    ]

    return round(final_score * 100, 2), common_interests


def update_questionnaire(store, user_id: str, payload: dict) -> dict | None:
    user = store.collection('users').get_document(user_id)
    if not user:
        return None
    user['personality_answers'] = payload['personality_answers']
    user['interest_answers'] = payload['interest_answers']
    user['personality_vector'] = compute_personality_vector(payload['personality_answers'])
    user['interest_vector'] = compute_interest_vector(payload['interest_answers'])
    store.collection('users').save_document(user)
    return {
        'personality_vector': user['personality_vector'],
        'interest_vector': user['interest_vector'],
    }


def get_recommendations(store, user_id: str, limit: int = 10) -> list[dict]:
    current_user = store.collection('users').get_document(user_id)
    if not current_user:
        return []

    users = store.collection('users').list_documents()
    recommendations = []
    for user in users:
        if user['_id'] == user_id:
            continue
        percentage, common_interests = _match_percentage(current_user, user)
        recommendations.append(
            {
                'id': user['_id'],
                'name': user['name'],
                'major': user['major'],
                'year': user['year'],
                'matchPercentage': round(percentage),
                'interests': common_interests or user.get('interests', [])[:3],
                'avatarUrl': user['avatar'],
                'bio': user.get('bio', ''),
                'online': user.get('online', False),
            }
        )
    recommendations.sort(key=lambda item: item['matchPercentage'], reverse=True)
    return recommendations[:limit]


def get_live_recommendations(store, user_id: str, limit: int = 6) -> list[dict]:
    recommendations = get_recommendations(store, user_id=user_id, limit=limit)
    return [
        {
            'id': recommendation['id'],
            'name': recommendation['name'],
            'year': f"Year {recommendation['year']}",
            'major': recommendation['major'],
            'tags': recommendation['interests'],
            'bio': recommendation['bio'],
            'avatar': recommendation['avatarUrl'],
            'interest': recommendation['matchPercentage'],
        }
        for recommendation in recommendations
    ]


def get_match_summary(store, user_id: str) -> dict:
    connections = store.collection('connections').list_documents()
    return {
        'activeMatches': sum(1 for connection in connections if user_id in connection['user_ids'] and connection['status'] == 'accepted'),
        'pendingRequests': sum(1 for connection in connections if user_id in connection['user_ids'] and connection['status'] == 'pending'),
        'recommendations': get_recommendations(store, user_id, limit=4),
    }


def record_action(store, user_id: str, payload: dict) -> dict | None:
    target_user_id = payload['target_user_id']
    action = payload['action']
    if user_id == target_user_id:
        return None

    collection = store.collection('connections')
    connection = None
    for candidate in collection.list_documents():
        if sorted(candidate['user_ids']) == sorted([user_id, target_user_id]):
            connection = candidate
            break

    now = now_iso()
    if not connection:
        connection = {
            '_id': new_id('conn'),
            'user_ids': sorted([user_id, target_user_id]),
            'status': 'pending',
            'initiated_by': user_id,
            'updated_at': now,
        }

    if action == 'pass':
        connection['status'] = 'passed'
    elif action == 'like':
        if connection['status'] == 'pending' and connection['initiated_by'] == target_user_id:
            connection['status'] = 'accepted'
        else:
            connection['status'] = 'pending'
            connection['initiated_by'] = user_id
    elif action == 'accept':
        connection['status'] = 'accepted'
    elif action == 'decline':
        connection['status'] = 'declined'

    connection['updated_at'] = now
    collection.save_document(connection)
    return connection
