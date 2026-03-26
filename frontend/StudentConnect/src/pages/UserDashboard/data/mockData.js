// ── Mock Data for StudentConnect Dashboard ──

export const currentUser = {
    id: 'u0',
    name: 'Sayak M',
    major: 'Computer Science',
    year: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sayak',
    online: true,
    bio: 'Full-stack developer & open-source enthusiast',
    email: 'sayak@studentconnect.edu',
    semester: 5,
    interests: ['Web Development', 'Machine Learning', 'UI/UX Design'],
};

export const users = [
    {
        id: 'u1',
        name: 'Priya R',
        major: 'Computer Science',
        year: 2,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        online: true,
        bio: 'Machine learning enthusiast',
    },
    {
        id: 'u2',
        name: 'Amit K',
        major: 'Electrical Engineering',
        year: 3,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
        online: false,
        bio: 'Circuit design and embedded systems',
    },
    {
        id: 'u3',
        name: 'Sara L',
        major: 'Data Science',
        year: 2,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
        online: true,
        bio: 'Data visualization & analytics',
    },
    {
        id: 'u4',
        name: 'Rohan D',
        major: 'Mechanical Engineering',
        year: 4,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
        online: false,
        bio: 'Robotics and automation projects',
    },
    {
        id: 'u5',
        name: 'Neha S',
        major: 'Physics',
        year: 3,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha',
        online: true,
        bio: 'Quantum computing researcher',
    },
    {
        id: 'u6',
        name: 'Vikram P',
        major: 'Computer Science',
        year: 2,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
        online: false,
        bio: 'Backend developer, loves Go and Rust',
    },
];

export const dashboardOverview = {
    activeMatches: 4,
    pendingRequests: 2,
    activeProjects: 3,
    upcomingDeadlines: 2,
    forumMentions: 7,
    recentActivity: [
        { id: 'a1', type: 'message', text: 'Priya sent you a message', time: '2026-02-27T12:40:00Z', icon: 'message' },
        { id: 'a2', type: 'project', text: 'You were added to Project: Optical Lab', time: '2026-02-26T09:22:00Z', icon: 'folder' },
        { id: 'a3', type: 'forum', text: 'Sara upvoted your comment in "ML Study Group"', time: '2026-02-25T18:15:00Z', icon: 'thumbs-up' },
        { id: 'a4', type: 'project', text: 'Deadline approaching: Physics Report due Feb 28', time: '2026-02-25T08:00:00Z', icon: 'clock' },
        { id: 'a5', type: 'match', text: 'New match! Vikram shares 3 interests with you', time: '2026-02-24T14:30:00Z', icon: 'users' },
        { id: 'a6', type: 'message', text: 'Rohan invited you to collaborate', time: '2026-02-24T10:05:00Z', icon: 'user-plus' },
    ],
};

export const chatThreads = [
    {
        threadId: 't1',
        name: 'Priya R',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        lastMessage: 'See you at 6!',
        unread: 1,
        lastTime: '2026-02-27T12:40:00Z',
        type: 'personal',
        online: true,
    },
    {
        threadId: 't2',
        name: 'Group: Physics Lab',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhysicsLab',
        lastMessage: 'Files updated — check the shared folder',
        unread: 0,
        lastTime: '2026-02-25T10:10:00Z',
        type: 'project',
        online: false,
    },
    {
        threadId: 't3',
        name: 'Amit K',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
        lastMessage: 'Can you review my PR?',
        unread: 3,
        lastTime: '2026-02-26T15:30:00Z',
        type: 'personal',
        online: false,
    },
    {
        threadId: 't4',
        name: 'Neha S',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha',
        lastMessage: 'Friend request',
        unread: 1,
        lastTime: '2026-02-27T09:00:00Z',
        type: 'request',
        online: true,
    },
];

export const chatMessages = {
    t1: [
        { id: 'm1', senderId: 'u1', text: 'Hey! Are we meeting for the study group today?', time: '2026-02-27T12:30:00Z', status: 'seen' },
        { id: 'm2', senderId: 'u0', text: 'Yes! Library at 6pm works for me.', time: '2026-02-27T12:35:00Z', status: 'seen' },
        { id: 'm3', senderId: 'u1', text: 'See you at 6!', time: '2026-02-27T12:40:00Z', status: 'delivered' },
    ],
    t2: [
        { id: 'm4', senderId: 'u5', text: 'I uploaded the lab report draft.', time: '2026-02-25T09:50:00Z', status: 'seen' },
        { id: 'm5', senderId: 'u2', text: 'Great, I\'ll review it tonight.', time: '2026-02-25T10:00:00Z', status: 'seen' },
        { id: 'm6', senderId: 'u0', text: 'Thanks Neha! I\'ll add the graphs section.', time: '2026-02-25T10:05:00Z', status: 'seen' },
        { id: 'm7', senderId: 'u5', text: 'Files updated — check the shared folder', time: '2026-02-25T10:10:00Z', status: 'delivered' },
    ],
    t3: [
        { id: 'm8', senderId: 'u2', text: 'Hey, I pushed a new branch for the sensor module.', time: '2026-02-26T14:00:00Z', status: 'seen' },
        { id: 'm9', senderId: 'u2', text: 'Can you review my PR?', time: '2026-02-26T15:30:00Z', status: 'delivered' },
    ],
    t4: [],
};

export const projects = [
    {
        id: 'p1',
        title: 'Optical Lab',
        projectId: 'STU-1234',
        description: 'Collaborative optical physics experiment platform with simulation tools and data analysis.',
        members: [
            { id: 'u0', name: 'Sayak M', role: 'owner' },
            { id: 'u2', name: 'Amit K', role: 'maintainer' },
            { id: 'u5', name: 'Neha S', role: 'collaborator' },
        ],
        progress: 67,
        visibility: 'public',
        tags: ['Physics', 'Simulation', 'Data Analysis'],
        tasks: [
            { id: 'tk1', title: 'Set up experiment parameters', status: 'done', assignee: 'u0' },
            { id: 'tk2', title: 'Build data collection module', status: 'done', assignee: 'u2' },
            { id: 'tk3', title: 'Create visualization dashboard', status: 'in-progress', assignee: 'u0' },
            { id: 'tk4', title: 'Write final report', status: 'todo', assignee: 'u5' },
            { id: 'tk5', title: 'Peer review submission', status: 'todo', assignee: 'u2' },
        ],
        activity: [
            { text: 'Sayak updated task "Create visualization dashboard"', time: '2026-02-27T11:00:00Z' },
            { text: 'Amit completed "Build data collection module"', time: '2026-02-26T16:00:00Z' },
        ],
    },
    {
        id: 'p2',
        title: 'ML Study Group Hub',
        projectId: 'STU-5678',
        description: 'Shared resources, notebooks, and discussion threads for our machine learning study group.',
        members: [
            { id: 'u1', name: 'Priya R', role: 'owner' },
            { id: 'u0', name: 'Sayak M', role: 'collaborator' },
            { id: 'u3', name: 'Sara L', role: 'collaborator' },
            { id: 'u6', name: 'Vikram P', role: 'viewer' },
        ],
        progress: 42,
        visibility: 'private',
        tags: ['Machine Learning', 'Python', 'Study Group'],
        tasks: [
            { id: 'tk6', title: 'Curate dataset collection', status: 'done', assignee: 'u3' },
            { id: 'tk7', title: 'Week 3 notebook: CNNs', status: 'in-progress', assignee: 'u1' },
            { id: 'tk8', title: 'Week 4 notebook: Transformers', status: 'todo', assignee: 'u0' },
            { id: 'tk9', title: 'Build project showcase page', status: 'todo', assignee: 'u6' },
        ],
        activity: [
            { text: 'Priya started work on "Week 3 notebook: CNNs"', time: '2026-02-27T09:00:00Z' },
            { text: 'Sara completed "Curate dataset collection"', time: '2026-02-25T14:00:00Z' },
        ],
    },
];

export const forumCategories = [
    { id: 'cat1', name: 'General Discussion', icon: 'message-circle', count: 24 },
    { id: 'cat2', name: 'Study Groups', icon: 'book-open', count: 18 },
    { id: 'cat3', name: 'Project Showcase', icon: 'award', count: 12 },
    { id: 'cat4', name: 'Help & Support', icon: 'help-circle', count: 31 },
];

export const forumThreads = [
    {
        id: 'f1',
        categoryId: 'cat1',
        title: 'Best resources for learning React in 2026?',
        author: users[0],
        createdAt: '2026-02-20T10:00:00Z',
        lastActivity: '2026-02-27T14:22:00Z',
        upvotes: 34,
        downvotes: 2,
        replies: 12,
        bookmarked: false,
        pinned: true,
        comments: [
            {
                id: 'c1', author: users[0], text: 'I found the new React docs really helpful, especially the interactive tutorials. Also recommend the "Thinking in React" section.',
                time: '2026-02-20T10:00:00Z', upvotes: 18, downvotes: 0,
                replies: [
                    { id: 'c1r1', author: users[2], text: 'Agreed! The new docs are excellent. I also like Fireship\'s videos for quick overviews.', time: '2026-02-20T11:30:00Z', upvotes: 7, downvotes: 0 },
                ],
            },
            {
                id: 'c2', author: users[4], text: 'For state management, I\'d suggest starting with useReducer before jumping to external libraries.',
                time: '2026-02-21T09:15:00Z', upvotes: 12, downvotes: 1,
                replies: [],
            },
        ],
    },
    {
        id: 'f2',
        categoryId: 'cat2',
        title: 'Looking for ML study partners — starting with Andrew Ng\'s course',
        author: users[2],
        createdAt: '2026-02-22T14:00:00Z',
        lastActivity: '2026-02-26T18:00:00Z',
        upvotes: 21,
        downvotes: 0,
        replies: 8,
        bookmarked: true,
        pinned: false,
        comments: [
            {
                id: 'c3', author: users[2], text: 'Starting Week 1 of the ML Specialization on Monday. Who\'s in?',
                time: '2026-02-22T14:00:00Z', upvotes: 15, downvotes: 0,
                replies: [
                    { id: 'c3r1', author: users[0], text: 'Count me in! I\'ve been meaning to revisit the fundamentals.', time: '2026-02-22T15:00:00Z', upvotes: 4, downvotes: 0 },
                    { id: 'c3r2', author: users[5], text: 'I\'m interested too. Should we set up a shared repo?', time: '2026-02-22T16:00:00Z', upvotes: 6, downvotes: 0 },
                ],
            },
        ],
    },
    {
        id: 'f3',
        categoryId: 'cat3',
        title: 'Project Showcase: Real-time IoT Dashboard',
        author: users[1],
        createdAt: '2026-02-18T09:00:00Z',
        lastActivity: '2026-02-25T12:00:00Z',
        upvotes: 45,
        downvotes: 3,
        replies: 15,
        bookmarked: false,
        pinned: false,
        comments: [
            {
                id: 'c4', author: users[1], text: 'Built a real-time dashboard for our EE lab sensors using WebSockets and D3.js. Check it out!',
                time: '2026-02-18T09:00:00Z', upvotes: 28, downvotes: 1,
                replies: [
                    { id: 'c4r1', author: users[3], text: 'This is incredible! How do you handle the data throughput?', time: '2026-02-18T10:00:00Z', upvotes: 5, downvotes: 0 },
                ],
            },
        ],
    },
    {
        id: 'f4',
        categoryId: 'cat4',
        title: 'Help: Git merge conflict nightmare',
        author: users[5],
        createdAt: '2026-02-24T16:00:00Z',
        lastActivity: '2026-02-27T10:00:00Z',
        upvotes: 8,
        downvotes: 0,
        replies: 6,
        bookmarked: false,
        pinned: false,
        comments: [
            {
                id: 'c5', author: users[5], text: 'I rebased onto main and now have 47 merge conflicts. Any tips for resolving them efficiently?',
                time: '2026-02-24T16:00:00Z', upvotes: 5, downvotes: 0,
                replies: [
                    { id: 'c5r1', author: users[0], text: 'Try using `git rerere` — it remembers how you resolved conflicts before. Also VS Code\'s merge editor is great.', time: '2026-02-24T17:00:00Z', upvotes: 8, downvotes: 0 },
                ],
            },
        ],
    },
    {
        id: 'f5',
        categoryId: 'cat1',
        title: 'Tips for staying productive during exam season',
        author: users[3],
        createdAt: '2026-02-23T08:00:00Z',
        lastActivity: '2026-02-26T20:00:00Z',
        upvotes: 29,
        downvotes: 1,
        replies: 18,
        bookmarked: false,
        pinned: false,
        comments: [
            {
                id: 'c6', author: users[3], text: 'Pomodoro technique + blocking social media has been a game changer for me.',
                time: '2026-02-23T08:00:00Z', upvotes: 20, downvotes: 0,
                replies: [],
            },
        ],
    },
    {
        id: 'f6',
        categoryId: 'cat2',
        title: 'Weekly DSA practice group — LeetCode sessions',
        author: users[4],
        createdAt: '2026-02-19T11:00:00Z',
        lastActivity: '2026-02-27T08:00:00Z',
        upvotes: 38,
        downvotes: 2,
        replies: 22,
        bookmarked: true,
        pinned: true,
        comments: [
            {
                id: 'c7', author: users[4], text: 'Hosting weekly 2-hour sessions every Saturday. We cover 3 problems: easy → medium → hard. Join our Discord!',
                time: '2026-02-19T11:00:00Z', upvotes: 30, downvotes: 1,
                replies: [
                    { id: 'c7r1', author: users[2], text: 'This has been super helpful for my interview prep! Highly recommend.', time: '2026-02-19T13:00:00Z', upvotes: 10, downvotes: 0 },
                ],
            },
        ],
    },
];

export const groups = [
    { id: 'g1', name: 'AI/ML Cohort 2026', members: 24, invited: true },
    { id: 'g2', name: 'Web Dev Club', members: 45, invited: true },
    { id: 'g3', name: 'Robotics Society', members: 18, invited: false },
];

export const notificationSettings = {
    email: { messages: true, projects: true, forums: false, matches: true },
    push: { messages: true, projects: false, forums: false, matches: false },
    inApp: { messages: true, projects: true, forums: true, matches: true },
};

export const liveFeed = [
    {
        id: 'lf1', type: 'project', time: '2026-03-02T08:00:00Z',
        title: 'Optical Lab — New Collaboration Opening',
        description: 'Looking for 2 more collaborators to join the optical physics simulation project. Experience with Python & data viz preferred.',
        author: users[0] || { name: 'Sayak M', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sayak' },
        tags: ['Physics', 'Simulation', 'Open Collab'],
        stats: { members: 3, tasks: 5, progress: 67 },
    },
    {
        id: 'lf2', type: 'forum', time: '2026-03-02T07:30:00Z',
        title: 'Best resources for learning React in 2026?',
        description: 'Curating the best learning paths for React — share your favorite tutorials, docs, and courses.',
        author: users[0] || { name: 'Priya R', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
        tags: ['React', 'Web Dev', 'Discussion'],
        stats: { upvotes: 34, replies: 12 },
    },
    {
        id: 'lf3', type: 'project', time: '2026-03-01T18:00:00Z',
        title: 'ML Study Group Hub — Week 3 Notebook Ready',
        description: 'Week 3 notebook on CNNs is now live. Jump in to review, comment, or contribute your own experiments.',
        author: users[2] || { name: 'Sara L', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara' },
        tags: ['Machine Learning', 'Python', 'Notebooks'],
        stats: { members: 4, tasks: 4, progress: 42 },
    },
    {
        id: 'lf4', type: 'forum', time: '2026-03-01T14:00:00Z',
        title: 'Weekly DSA practice group — LeetCode sessions',
        description: 'Hosting weekly 2-hour sessions every Saturday. We cover 3 problems: easy → medium → hard. Join our Discord!',
        author: users[4] || { name: 'Neha S', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha' },
        tags: ['DSA', 'LeetCode', 'Study Group'],
        stats: { upvotes: 38, replies: 22 },
    },
    {
        id: 'lf5', type: 'forum', time: '2026-03-01T10:00:00Z',
        title: 'Project Showcase: Real-time IoT Dashboard',
        description: 'Built a real-time dashboard for our EE lab sensors using WebSockets and D3.js. Check it out!',
        author: users[1] || { name: 'Amit K', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit' },
        tags: ['IoT', 'WebSockets', 'Showcase'],
        stats: { upvotes: 45, replies: 15 },
    },
    {
        id: 'lf6', type: 'forum', time: '2026-02-28T20:00:00Z',
        title: 'Tips for staying productive during exam season',
        description: 'Pomodoro technique + blocking social media has been a game changer. What works for you?',
        author: users[3] || { name: 'Rohan D', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
        tags: ['Productivity', 'Exams', 'Discussion'],
        stats: { upvotes: 29, replies: 18 },
    },
    {
        id: 'lf7', type: 'project', time: '2026-02-28T15:00:00Z',
        title: 'Robotics Club — New Arm Assembly Project',
        description: 'Starting a new robotic arm assembly project. Looking for ME and CS students for hardware + software integration.',
        author: users[3] || { name: 'Rohan D', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
        tags: ['Robotics', 'Hardware', 'Open Collab'],
        stats: { members: 2, tasks: 0, progress: 5 },
    },
    {
        id: 'lf8', type: 'forum', time: '2026-02-28T09:00:00Z',
        title: 'Help: Git merge conflict nightmare',
        description: 'I rebased onto main and now have 47 merge conflicts. Any tips for resolving them efficiently?',
        author: users[5] || { name: 'Vikram P', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' },
        tags: ['Git', 'Help', 'DevOps'],
        stats: { upvotes: 8, replies: 6 },
    },
];
