const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://studentconnect-afez.onrender.com';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? API_BASE_URL.replace(/^https/i, 'wss').replace(/^http/i, 'ws');
const DEFAULT_USER_ID = import.meta.env.VITE_DEMO_USER_ID ?? 'u0';

async function request(path, options = {}) {
    const token = localStorage.getItem('sc_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
    };

    // Use JWT token if available, otherwise fall back to X-User-Id header
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        headers['X-User-Id'] = options.userId ?? DEFAULT_USER_ID;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export function getChatSocketUrl(threadId, userId = DEFAULT_USER_ID) {
    return `${WS_BASE_URL}/ws/chat/${threadId}?user_id=${encodeURIComponent(userId)}`;
}

export async function getDashboardOverview() {
    return request('/api/dashboard/overview');
}

export async function getDashboardAnalytics() {
    return request('/api/dashboard/analytics');
}

export async function getLiveFeed() {
    return request('/api/dashboard/feed');
}

export async function getChatThreads() {
    return request('/api/chat/threads');
}

export async function createChatThread(data) {
    return request('/api/chat/threads', { method: 'POST', body: data });
}

export async function updateChatThread(threadId, data) {
    return request(`/api/chat/threads/${threadId}`, { method: 'PATCH', body: data });
}

export async function markChatThreadRead(threadId) {
    return request(`/api/chat/threads/${threadId}/read`, { method: 'POST' });
}

export async function getMessages(threadId) {
    return request(`/api/chat/threads/${threadId}/messages`);
}

export async function sendMessage(threadId, text, attachments = []) {
    return request(`/api/chat/threads/${threadId}/messages`, {
        method: 'POST',
        body: { text, attachments },
    });
}

export async function getProjects() {
    return request('/api/projects');
}

export async function getProject(projectId) {
    return request(`/api/projects/${projectId}`);
}

export async function createProject(data) {
    return request('/api/projects', { method: 'POST', body: data });
}

export async function requestJoinProject(projectId) {
    return request('/api/projects/join', { method: 'POST', body: { project_id: projectId } });
}

export async function inviteToProject(projectId, payload) {
    return request(`/api/projects/${projectId}/invite`, { method: 'POST', body: payload });
}

export async function createProjectTask(projectId, payload) {
    return request(`/api/projects/${projectId}/tasks`, { method: 'POST', body: payload });
}

export async function updateProjectTask(projectId, taskId, payload) {
    return request(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body: payload });
}

export async function deleteProjectTask(projectId, taskId) {
    return request(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' });
}

export async function removeProjectMember(projectId, memberId) {
    return request(`/api/projects/${projectId}/members/${memberId}`, { method: 'DELETE' });
}

export async function getForumCategories() {
    return request('/api/forums/categories');
}

export async function getForumThreads() {
    return request('/api/forums/threads');
}

export async function getForumThread(threadId) {
    return request(`/api/forums/threads/${threadId}`);
}

export async function createForumThread(data) {
    return request('/api/forums/threads', { method: 'POST', body: data });
}

export async function voteThread(threadId, direction) {
    return request(`/api/forums/threads/${threadId}/vote`, { method: 'POST', body: { direction } });
}

export async function bookmarkForumThread(threadId, bookmarked) {
    return request(`/api/forums/threads/${threadId}/bookmark`, { method: 'POST', body: { bookmarked } });
}

export async function followForumThread(threadId, following) {
    return request(`/api/forums/threads/${threadId}/follow`, { method: 'POST', body: { following } });
}

export async function createForumComment(threadId, text) {
    return request(`/api/forums/threads/${threadId}/comments`, { method: 'POST', body: { text } });
}

export async function voteForumComment(threadId, commentId, direction) {
    return request(`/api/forums/threads/${threadId}/comments/${commentId}/vote`, { method: 'POST', body: { direction } });
}

export async function createForumReply(threadId, commentId, text) {
    return request(`/api/forums/threads/${threadId}/comments/${commentId}/replies`, { method: 'POST', body: { text } });
}

export async function getGroups() {
    return request('/api/groups');
}

export async function createGroup(data) {
    return request('/api/groups', { method: 'POST', body: data });
}

export async function joinGroup(groupId) {
    return request(`/api/groups/${groupId}/join`, { method: 'POST' });
}

export async function leaveGroup(groupId) {
    return request(`/api/groups/${groupId}/leave`, { method: 'POST' });
}

export async function inviteToGroup(groupId, userId) {
    return request(`/api/groups/${groupId}/invite`, { method: 'POST', body: { user_id: userId } });
}

export async function getUsers() {
    return request('/api/users');
}

export async function getCurrentUser() {
    return request('/api/me');
}

export async function updateProfile(data) {
    return request('/api/me', { method: 'PUT', body: data });
}

export async function getNotificationSettings() {
    return request('/api/settings/notifications');
}

export async function updateNotificationSettings(data) {
    return request('/api/settings/notifications', { method: 'PUT', body: data });
}

export async function getPrivacySettings() {
    return request('/api/settings/privacy');
}

export async function updatePrivacySettings(data) {
    return request('/api/settings/privacy', { method: 'PUT', body: data });
}

export async function getAccessibilitySettings() {
    return request('/api/settings/accessibility');
}

export async function updateAccessibilitySettings(data) {
    return request('/api/settings/accessibility', { method: 'PUT', body: data });
}

export async function getMatchRecommendations(limit = 10, mode = 'results') {
    return request(`/api/matches/recommendations?limit=${limit}&mode=${mode}`);
}

export async function getMatchResults(limit = 6) {
    return request(`/api/matches/results?limit=${limit}`);
}

export async function recordMatchAction(targetUserId, action) {
    return request('/api/matches/actions', {
        method: 'POST',
        body: { target_user_id: targetUserId, action },
    });
}

export async function updateMatchQuestionnaire(data) {
    return request('/api/matches/questionnaire', { method: 'POST', body: data });
}

export async function submitQuestionnaire(data) {
    return request('/api/questionnaire', { method: 'POST', body: data });
}

export async function getQuestionnaireStatus() {
    return request('/api/questionnaire/status');
}

export async function getMatchSummary() {
    return request('/api/matches/summary');
}
