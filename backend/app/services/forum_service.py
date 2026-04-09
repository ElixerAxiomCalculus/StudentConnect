from __future__ import annotations

from copy import deepcopy

from app.services.common import add_feed_item, add_recent_activity, count_forum_replies, get_user_map, new_id, now_iso, serialize_user_summary


_DELETED_USER_SUMMARY = {
    'id': 'deleted',
    'name': 'Deleted User',
    'major': '',
    'year': '',
    'avatar': '',
    'online': False,
    'bio': '',
}


def _resolve_author(user_map: dict[str, dict], author_id: str) -> dict:
    user = user_map.get(author_id)
    if user is None:
        return dict(_DELETED_USER_SUMMARY)
    return serialize_user_summary(user)


def _serialize_reply(reply: dict, user_map: dict[str, dict]) -> dict:
    return {
        'id': reply['id'],
        'author': _resolve_author(user_map, reply['author_id']),
        'text': reply['text'],
        'time': reply['time'],
        'upvotes': reply.get('upvotes', 0),
        'downvotes': reply.get('downvotes', 0),
    }


def _serialize_comment(comment: dict, user_map: dict[str, dict]) -> dict:
    return {
        'id': comment['id'],
        'author': _resolve_author(user_map, comment['author_id']),
        'text': comment['text'],
        'time': comment['time'],
        'upvotes': comment.get('upvotes', 0),
        'downvotes': comment.get('downvotes', 0),
        'replies': [_serialize_reply(reply, user_map) for reply in comment.get('replies', [])],
    }


def _serialize_thread(thread: dict, user_map: dict[str, dict]) -> dict:
    comments = [_serialize_comment(comment, user_map) for comment in thread.get('comments', [])]
    return {
        'id': thread['_id'],
        'categoryId': thread['category_id'],
        'title': thread['title'],
        'author': _resolve_author(user_map, thread['author_id']),
        'createdAt': thread['created_at'],
        'lastActivity': thread['last_activity'],
        'upvotes': thread.get('upvotes', 0),
        'downvotes': thread.get('downvotes', 0),
        'replies': count_forum_replies(thread.get('comments', [])),
        'bookmarked': False,
        'pinned': thread.get('pinned', False),
        'comments': comments,
        'tags': thread.get('tags', []),
    }


def list_categories(store) -> list[dict]:
    threads = store.collection('forum_threads').list_documents()
    categories = store.collection('forum_categories').list_documents()
    return [
        {
            'id': category['_id'],
            'name': category['name'],
            'icon': category.get('icon', ''),
            'count': sum(1 for thread in threads if thread['category_id'] == category['_id']),
        }
        for category in categories
    ]


def list_threads(store) -> list[dict]:
    user_map = get_user_map(store)
    threads = store.collection('forum_threads').list_documents()
    threads.sort(key=lambda thread: thread.get('last_activity', ''), reverse=True)
    return [_serialize_thread(thread, user_map) for thread in threads]


def get_thread(store, thread_id: str) -> dict | None:
    thread = store.collection('forum_threads').get_document(thread_id)
    if not thread:
        return None
    return _serialize_thread(thread, get_user_map(store))


def create_thread(store, user_id: str, payload: dict) -> dict:
    now = now_iso()
    comments = []
    if payload.get('content'):
        comments.append(
            {
                'id': new_id('c'),
                'author_id': user_id,
                'text': payload['content'],
                'time': now,
                'upvotes': 0,
                'downvotes': 0,
                'vote_users': {},
                'replies': [],
            }
        )

    thread = {
        '_id': new_id('f'),
        'category_id': payload['category_id'],
        'title': payload['title'],
        'body': payload.get('content', ''),
        'tags': payload.get('tags', []),
        'author_id': user_id,
        'created_at': now,
        'last_activity': now,
        'upvotes': 0,
        'downvotes': 0,
        'vote_users': {},
        'bookmarked_by': [],
        'follower_ids': [],
        'pinned': False,
        'comments': comments,
    }
    store.collection('forum_threads').save_document(thread)
    user = store.collection('users').get_document(user_id)
    add_feed_item(
        store,
        {
            '_id': new_id('lf'),
            'type': 'forum',
            'time': now,
            'title': thread['title'],
            'description': payload.get('content', ''),
            'author_id': user_id,
            'tags': payload.get('tags', []),
            'stats': {'upvotes': 0, 'replies': len(comments)},
            'target_id': thread['_id'],
        },
    )
    add_recent_activity(
        store,
        user_id,
        {'id': new_id('a'), 'type': 'forum', 'text': f'You posted "{thread["title"]}"', 'time': now, 'icon': 'message-square'},
    )
    return _serialize_thread(thread, get_user_map(store))


def vote_thread(store, thread_id: str, user_id: str, direction: str) -> dict | None:
    thread = store.collection('forum_threads').get_document(thread_id)
    if not thread:
        return None
    vote_users = thread.setdefault('vote_users', {})
    previous_vote = vote_users.get(user_id)
    if previous_vote == direction:
        return _serialize_thread(thread, get_user_map(store))

    if previous_vote == 'up':
        thread['upvotes'] = max(0, thread.get('upvotes', 0) - 1)
    if previous_vote == 'down':
        thread['downvotes'] = max(0, thread.get('downvotes', 0) - 1)

    vote_users[user_id] = direction
    if direction == 'up':
        thread['upvotes'] = thread.get('upvotes', 0) + 1
    else:
        thread['downvotes'] = thread.get('downvotes', 0) + 1

    store.collection('forum_threads').save_document(thread)
    return _serialize_thread(thread, get_user_map(store))


def toggle_bookmark(store, thread_id: str, user_id: str, bookmarked: bool | None = None) -> dict | None:
    thread = store.collection('forum_threads').get_document(thread_id)
    if not thread:
        return None
    bookmarked_by = set(thread.get('bookmarked_by', []))
    should_bookmark = bookmarked if bookmarked is not None else user_id not in bookmarked_by
    if should_bookmark:
        bookmarked_by.add(user_id)
    else:
        bookmarked_by.discard(user_id)
    thread['bookmarked_by'] = list(bookmarked_by)
    store.collection('forum_threads').save_document(thread)
    return _serialize_thread(thread, get_user_map(store))


def toggle_follow(store, thread_id: str, user_id: str, following: bool | None = None) -> dict | None:
    thread = store.collection('forum_threads').get_document(thread_id)
    if not thread:
        return None
    follower_ids = set(thread.get('follower_ids', []))
    should_follow = following if following is not None else user_id not in follower_ids
    if should_follow:
        follower_ids.add(user_id)
    else:
        follower_ids.discard(user_id)
    thread['follower_ids'] = list(follower_ids)
    store.collection('forum_threads').save_document(thread)
    return _serialize_thread(thread, get_user_map(store))


def add_comment(store, thread_id: str, user_id: str, text: str) -> dict | None:
    thread = store.collection('forum_threads').get_document(thread_id)
    if not thread:
        return None
    now = now_iso()
    comment = {
        'id': new_id('c'),
        'author_id': user_id,
        'text': text,
        'time': now,
        'upvotes': 0,
        'downvotes': 0,
        'vote_users': {},
        'replies': [],
    }
    thread.setdefault('comments', []).append(comment)
    thread['last_activity'] = now
    store.collection('forum_threads').save_document(thread)
    return _serialize_thread(thread, get_user_map(store))


def add_reply(store, thread_id: str, comment_id: str, user_id: str, text: str) -> dict | None:
    thread = store.collection('forum_threads').get_document(thread_id)
    if not thread:
        return None

    now = now_iso()
    for comment in thread.get('comments', []):
        if comment['id'] != comment_id:
            continue
        comment.setdefault('replies', []).append(
            {
                'id': new_id('r'),
                'author_id': user_id,
                'text': text,
                'time': now,
                'upvotes': 0,
                'downvotes': 0,
                'vote_users': {},
            }
        )
        thread['last_activity'] = now
        store.collection('forum_threads').save_document(thread)
        return _serialize_thread(thread, get_user_map(store))
    return None


def vote_comment(store, thread_id: str, comment_id: str, user_id: str, direction: str) -> dict | None:
    thread = store.collection('forum_threads').get_document(thread_id)
    if not thread:
        return None

    def apply_vote(item: dict) -> bool:
        if item['id'] != comment_id:
            return False
        vote_users = item.setdefault('vote_users', {})
        previous_vote = vote_users.get(user_id)
        if previous_vote == direction:
            return True
        if previous_vote == 'up':
            item['upvotes'] = max(0, item.get('upvotes', 0) - 1)
        if previous_vote == 'down':
            item['downvotes'] = max(0, item.get('downvotes', 0) - 1)
        vote_users[user_id] = direction
        if direction == 'up':
            item['upvotes'] = item.get('upvotes', 0) + 1
        else:
            item['downvotes'] = item.get('downvotes', 0) + 1
        return True

    for comment in thread.get('comments', []):
        if apply_vote(comment):
            store.collection('forum_threads').save_document(thread)
            return _serialize_thread(thread, get_user_map(store))
        for reply in comment.get('replies', []):
            if apply_vote(reply):
                store.collection('forum_threads').save_document(thread)
                return _serialize_thread(thread, get_user_map(store))
    return None
