// ── Mock API functions (simulating REST endpoints) ──
import {
    dashboardOverview,
    chatThreads,
    chatMessages,
    projects,
    forumThreads,
    forumCategories,
    users,
    currentUser,
    notificationSettings,
    liveFeed,
} from './mockData';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// GET /api/dashboard/overview
export async function getDashboardOverview() {
    await delay(250);
    return { ...dashboardOverview };
}

// GET /api/feed
export async function getLiveFeed() {
    await delay(200);
    return [...liveFeed].sort((a, b) => new Date(b.time) - new Date(a.time));
}

// GET /api/chat/threads
export async function getChatThreads() {
    await delay(200);
    return [...chatThreads];
}

// GET /api/chat/threads/:threadId/messages
export async function getMessages(threadId) {
    await delay(200);
    return chatMessages[threadId] ? [...chatMessages[threadId]] : [];
}

// POST /api/chat/threads/:threadId/messages  — send a message
export async function sendMessage(threadId, text) {
    await delay(150);
    const msg = {
        id: 'm' + Date.now(),
        senderId: 'u0',
        text,
        time: new Date().toISOString(),
        status: 'delivered',
    };
    if (!chatMessages[threadId]) chatMessages[threadId] = [];
    chatMessages[threadId].push(msg);
    return msg;
}

// Simulated auto-reply (fake WebSocket incoming message)
export function simulateReply(threadId, callback) {
    const replies = [
        'Sounds good! 👍',
        'Let me check and get back to you.',
        'That\'s a great idea!',
        'Sure, I\'ll work on it tonight.',
        'Can we discuss this tomorrow?',
    ];
    const timeout = setTimeout(() => {
        const reply = {
            id: 'm' + Date.now(),
            senderId: chatThreads.find((t) => t.threadId === threadId)?.threadId === 't2' ? 'u5' : 'u1',
            text: replies[Math.floor(Math.random() * replies.length)],
            time: new Date().toISOString(),
            status: 'delivered',
        };
        if (!chatMessages[threadId]) chatMessages[threadId] = [];
        chatMessages[threadId].push(reply);
        callback(reply);
    }, 1500 + Math.random() * 2000);
    return () => clearTimeout(timeout);
}

// GET /api/projects
export async function getProjects() {
    await delay(300);
    return [...projects];
}

// POST /api/projects  — create project
export async function createProject(data) {
    await delay(400);
    const project = {
        id: 'p' + Date.now(),
        projectId: 'STU-' + Math.floor(1000 + Math.random() * 9000),
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        visibility: data.visibility || 'public',
        members: [{ id: 'u0', name: currentUser.name, role: 'owner' }],
        progress: 0,
        tasks: [],
        activity: [{ text: `${currentUser.name} created this project`, time: new Date().toISOString() }],
    };
    projects.push(project);
    return project;
}

// GET /api/forums/categories
export async function getForumCategories() {
    await delay(200);
    return [...forumCategories];
}

// GET /api/forums/threads
export async function getForumThreads() {
    await delay(300);
    return [...forumThreads];
}

// POST /api/forums/threads/:threadId/vote
export async function voteThread(threadId, direction) {
    await delay(100);
    const thread = forumThreads.find((t) => t.id === threadId);
    if (thread) {
        if (direction === 'up') thread.upvotes++;
        else thread.downvotes++;
    }
    return thread;
}

// GET /api/users
export async function getUsers() {
    await delay(200);
    return [...users];
}

// GET /api/me
export async function getCurrentUser() {
    await delay(100);
    return { ...currentUser };
}

// PUT /api/me  — update profile
export async function updateProfile(data) {
    await delay(300);
    Object.assign(currentUser, data);
    return { ...currentUser };
}

// GET /api/settings/notifications
export async function getNotificationSettings() {
    await delay(150);
    return { ...notificationSettings };
}

// PUT /api/settings/notifications
export async function updateNotificationSettings(data) {
    await delay(200);
    Object.assign(notificationSettings, data);
    return { ...notificationSettings };
}
