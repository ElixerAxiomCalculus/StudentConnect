from __future__ import annotations

from app.services.common import add_feed_item, add_recent_activity, calculate_project_progress, get_user_map, new_id, now_iso, serialize_member


def _serialize_project(project: dict, user_map: dict[str, dict]) -> dict:
    members = [serialize_member(member, user_map) for member in project.get('members', [])]
    return {
        'id': project['_id'],
        'projectId': project['project_id'],
        'title': project['title'],
        'description': project.get('description', ''),
        'members': members,
        'progress': project.get('progress', calculate_project_progress(project.get('tasks', []))),
        'visibility': project.get('visibility', 'public'),
        'tags': project.get('tags', []),
        'tasks': project.get('tasks', []),
        'activity': project.get('activity', []),
    }


def list_projects(store) -> list[dict]:
    user_map = get_user_map(store)
    projects = store.collection('projects').list_documents()
    return [_serialize_project(project, user_map) for project in projects]


def get_project(store, project_id: str) -> dict | None:
    project = store.collection('projects').get_document(project_id)
    if not project:
        return None
    return _serialize_project(project, get_user_map(store))


def create_project(store, user_id: str, payload: dict) -> dict:
    now = now_iso()
    project = {
        '_id': new_id('p'),
        'project_id': f"STU-{new_id('')[:4].upper()}",
        'title': payload['title'],
        'description': payload.get('description', ''),
        'visibility': payload.get('visibility', 'public'),
        'tags': payload.get('tags', []),
        'owner_id': user_id,
        'members': [{'id': user_id, 'role': 'owner'}],
        'join_requests': [],
        'tasks': [],
        'activity': [{'text': 'Project created', 'time': now}],
        'progress': 0,
        'thread_id': '',
    }
    store.collection('projects').save_document(project)
    add_feed_item(
        store,
        {
            '_id': new_id('lf'),
            'type': 'project',
            'time': now,
            'title': project['title'],
            'description': project['description'],
            'author_id': user_id,
            'tags': project['tags'],
            'stats': {'members': 1, 'tasks': 0, 'progress': 0},
            'target_id': project['_id'],
        },
    )
    add_recent_activity(
        store,
        user_id,
        {'id': new_id('a'), 'type': 'project', 'text': f'You created "{project["title"]}"', 'time': now, 'icon': 'folder'},
    )
    return _serialize_project(project, get_user_map(store))


def request_join_project(store, project_public_id: str, user_id: str) -> dict | None:
    projects = store.collection('projects').list_documents()
    for project in projects:
        if project['project_id'] != project_public_id:
            continue
        requests = project.setdefault('join_requests', [])
        if user_id not in requests and not any(member['id'] == user_id for member in project.get('members', [])):
            requests.append(user_id)
            store.collection('projects').save_document(project)
        return _serialize_project(project, get_user_map(store))
    return None


def invite_to_project(store, project_id: str, payload: dict) -> dict | None:
    project = store.collection('projects').get_document(project_id)
    if not project:
        return None

    target_user_id = payload.get('user_id')
    query = (payload.get('query') or '').strip().lower()
    if not target_user_id and query:
        for user in store.collection('users').list_documents():
            if user['_id'] == query or query in user['name'].lower():
                target_user_id = user['_id']
                break
    if target_user_id and not any(member['id'] == target_user_id for member in project.get('members', [])):
        project.setdefault('join_requests', [])
        if target_user_id not in project['join_requests']:
            project['join_requests'].append(target_user_id)
        store.collection('projects').save_document(project)
    return _serialize_project(project, get_user_map(store))


def add_task(store, project_id: str, user_id: str, payload: dict) -> dict | None:
    project = store.collection('projects').get_document(project_id)
    if not project:
        return None
    task = {
        'id': new_id('tk'),
        'title': payload['title'],
        'description': payload.get('description', ''),
        'assignee': payload.get('assignee') or user_id,
        'deadline': payload.get('deadline'),
        'status': payload.get('status', 'todo'),
    }
    project.setdefault('tasks', []).append(task)
    project['progress'] = calculate_project_progress(project['tasks'])
    project.setdefault('activity', []).insert(0, {'text': f'Task "{task["title"]}" added', 'time': now_iso()})
    store.collection('projects').save_document(project)
    return _serialize_project(project, get_user_map(store))


def update_task(store, project_id: str, task_id: str, payload: dict) -> dict | None:
    project = store.collection('projects').get_document(project_id)
    if not project:
        return None
    for task in project.get('tasks', []):
        if task['id'] != task_id:
            continue
        for key in ['title', 'description', 'assignee', 'deadline', 'status']:
            if payload.get(key) is not None:
                task[key] = payload[key]
        project['progress'] = calculate_project_progress(project['tasks'])
        project.setdefault('activity', []).insert(0, {'text': f'Task "{task["title"]}" updated', 'time': now_iso()})
        store.collection('projects').save_document(project)
        return _serialize_project(project, get_user_map(store))
    return None


def delete_task(store, project_id: str, task_id: str) -> dict | None:
    project = store.collection('projects').get_document(project_id)
    if not project:
        return None
    project['tasks'] = [task for task in project.get('tasks', []) if task['id'] != task_id]
    project['progress'] = calculate_project_progress(project['tasks'])
    project.setdefault('activity', []).insert(0, {'text': 'Task removed', 'time': now_iso()})
    store.collection('projects').save_document(project)
    return _serialize_project(project, get_user_map(store))


def remove_member(store, project_id: str, member_id: str) -> dict | None:
    project = store.collection('projects').get_document(project_id)
    if not project:
        return None
    project['members'] = [member for member in project.get('members', []) if member['id'] != member_id]
    store.collection('projects').save_document(project)
    return _serialize_project(project, get_user_map(store))
