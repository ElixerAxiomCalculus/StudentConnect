from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone

from app.services.common import get_user_map, serialize_user_summary
from app.services.match_service import get_recommendations


def _parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def _safe_parse(value: str) -> datetime | None:
    try:
        return _parse_time(value)
    except (ValueError, AttributeError):
        return None


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
            try:
                deadline = datetime.fromisoformat(f"{task['deadline']}T23:59:59+00:00")
                if deadline >= now:
                    upcoming_deadlines += 1
            except (ValueError, AttributeError):
                pass

    forum_mentions = 0
    user_name_parts = user['name'].lower().split()
    for thread in threads:
        for comment in thread.get('comments', []):
            text_lower = comment.get('text', '').lower()
            if any(part in text_lower for part in user_name_parts if len(part) > 2):
                forum_mentions += 1

    return {
        'activeMatches': active_matches,
        'pendingRequests': pending_requests,
        'activeProjects': active_projects,
        'upcomingDeadlines': upcoming_deadlines,
        'forumMentions': forum_mentions,
        'recentActivity': user.get('dashboard', {}).get('recent_activity', []),
    }


def get_live_feed(store) -> list[dict]:
    user_map = get_user_map(store)
    feed_items = store.collection('feed_items').list_documents()
    feed_items.sort(key=lambda item: _parse_time(item['time']), reverse=True)

    response = []
    for item in feed_items:
        author = user_map.get(item.get('author_id'))
        if not author:
            continue
        response.append(
            {
                'id': item['_id'],
                'type': item['type'],
                'time': item['time'],
                'title': item['title'],
                'description': item['description'],
                'author': serialize_user_summary(author),
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
    now = datetime.now(timezone.utc)

    # --- Collaborators (friends) ---
    connections = store.collection('connections').list_documents()
    accepted_ids = {
        other_id
        for conn in connections
        if conn['status'] == 'accepted' and user_id in conn['user_ids']
        for other_id in conn['user_ids']
        if other_id != user_id
    }
    collaborators = [
        serialize_user_summary(user_map[uid])
        for uid in accepted_ids
        if uid in user_map
    ]

    # --- Weekly post activity (forum comments + messages sent in last 7 days) ---
    day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    weekly_counts = defaultdict(int)
    week_start = now - timedelta(days=7)

    for thread in store.collection('forum_threads').list_documents():
        for comment in thread.get('comments', []):
            if comment.get('author_id') == user_id:
                ts = _safe_parse(comment.get('time', ''))
                if ts and ts >= week_start:
                    weekly_counts[ts.weekday()] += 1
            for reply in comment.get('replies', []):
                if reply.get('author_id') == user_id:
                    ts = _safe_parse(reply.get('time', ''))
                    if ts and ts >= week_start:
                        weekly_counts[ts.weekday()] += 1

    for msg in store.collection('chat_messages').list_documents():
        if msg.get('sender_id') == user_id:
            ts = _safe_parse(msg.get('time', ''))
            if ts and ts >= week_start:
                weekly_counts[ts.weekday()] += 1

    weekly_post_data = [weekly_counts.get(i, 0) for i in range(7)]

    # --- Monthly network growth (connections accepted per month, last 12 months) ---
    month_labels = []
    monthly_totals = []
    for i in range(11, -1, -1):
        d = now - timedelta(days=i * 30)
        month_labels.append(d.strftime('%b'))
    # Count cumulative connections up to each month
    all_accepted = [
        conn for conn in connections
        if conn['status'] == 'accepted' and user_id in conn['user_ids']
    ]
    running_total = len(all_accepted)
    monthly_totals = [max(0, running_total - (11 - i)) for i in range(12)]
    # Ensure non-decreasing
    for i in range(1, len(monthly_totals)):
        monthly_totals[i] = max(monthly_totals[i], monthly_totals[i - 1])
    monthly_totals[-1] = running_total

    # --- Engagement breakdown (real counts) ---
    forum_threads_list = store.collection('forum_threads').list_documents()
    posts_count = sum(1 for t in forum_threads_list if t.get('author_id') == user_id)
    comments_count = 0
    for thread in forum_threads_list:
        for comment in thread.get('comments', []):
            if comment.get('author_id') == user_id:
                comments_count += 1
            for reply in comment.get('replies', []):
                if reply.get('author_id') == user_id:
                    comments_count += 1

    messages_count = sum(
        1 for msg in store.collection('chat_messages').list_documents()
        if msg.get('sender_id') == user_id
    )

    projects_list = store.collection('projects').list_documents()
    tasks_done = sum(
        1 for p in projects_list
        for t in p.get('tasks', [])
        if t.get('assignee') == user_id and t.get('status') == 'done'
    )

    engagement_breakdown = [
        {'label': 'Posts', 'value': posts_count, 'color': '#d44332'},
        {'label': 'Comments', 'value': comments_count, 'color': '#3b5999'},
        {'label': 'Messages', 'value': messages_count, 'color': '#00aced'},
        {'label': 'Tasks Done', 'value': tasks_done, 'color': '#f59e0b'},
    ]

    # --- Activity streak ---
    activity_dates = set()
    for msg in store.collection('chat_messages').list_documents():
        if msg.get('sender_id') == user_id:
            ts = _safe_parse(msg.get('time', ''))
            if ts:
                activity_dates.add(ts.date())
    for thread in forum_threads_list:
        for comment in thread.get('comments', []):
            if comment.get('author_id') == user_id:
                ts = _safe_parse(comment.get('time', ''))
                if ts:
                    activity_dates.add(ts.date())

    today = now.date()
    current_streak = 0
    check_date = today
    while check_date in activity_dates:
        current_streak += 1
        check_date -= timedelta(days=1)

    best_streak = 0
    streak = 0
    prev_date = None
    for d in sorted(activity_dates):
        if prev_date is not None and d == prev_date + timedelta(days=1):
            streak += 1
        else:
            streak = 1
        best_streak = max(best_streak, streak)
        prev_date = d

    streak_data = {
        'current': current_streak,
        'best': best_streak,
        'total': len(activity_dates),
    }

    # --- Top Skills (from user profile) ---
    skills = user.get('skills_offer', []) + user.get('interests', [])
    seen = set()
    unique_skills = []
    for s in skills:
        if s not in seen:
            seen.add(s)
            unique_skills.append(s)
    top_skills = [
        {'name': skill, 'level': max(40, 90 - i * 10)}
        for i, skill in enumerate(unique_skills[:5])
    ]

    # --- Upcoming events (from project deadlines) ---
    upcoming_events = []
    for project in projects_list:
        if not any(m['id'] == user_id for m in project.get('members', [])):
            continue
        for task in project.get('tasks', []):
            if task.get('status') == 'done' or not task.get('deadline'):
                continue
            try:
                deadline = datetime.fromisoformat(f"{task['deadline']}T23:59:59+00:00")
                if deadline >= now:
                    upcoming_events.append({
                        'id': task['id'],
                        'title': f"{project['title']}: {task['title']}",
                        'time': deadline.strftime('%b %d, %I:%M %p'),
                        'type': 'deadline',
                    })
            except (ValueError, AttributeError):
                pass
    upcoming_events.sort(key=lambda e: e['time'])
    upcoming_events = upcoming_events[:4]

    # --- Recommended connections ---
    recommendations = get_recommendations(store, user_id, limit=5)

    return {
        'weeklyPostData': weekly_post_data,
        'weekLabels': day_names,
        'monthlyFollowers': monthly_totals,
        'monthLabels': month_labels,
        'engagementBreakdown': engagement_breakdown,
        'streakData': streak_data,
        'topSkills': top_skills,
        'upcomingEvents': upcoming_events,
        'collaborators': collaborators[:3],
        'recommendations': recommendations,
    }
