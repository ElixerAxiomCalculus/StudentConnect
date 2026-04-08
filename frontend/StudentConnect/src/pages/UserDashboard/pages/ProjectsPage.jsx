import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus, ExternalLink, UserPlus, LogOut as LeaveIcon,
    Eye, Shield, Crown, Wrench, ChevronLeft, Search,
    Copy, Clipboard, Calendar, Clock, CheckCircle2, Circle,
    AlertCircle, MoreVertical, X, Trash2, Edit3,
    FolderKanban, ListFilter, BarChart3, Users, Tag,
    Lock, Globe, ArrowUpRight, Activity, MessageSquare,
    Sparkles, GripVertical, ChevronRight, Bell
} from 'lucide-react';
import FrostCard from '../components/FrostCard';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { getProjects, createProject, getCurrentUser, getUsers, createProjectTask, updateProjectTask, deleteProjectTask, removeProjectMember } from '../data/api';
import gsap from 'gsap';

const roleIcons = {
    owner: <Crown size={12} />,
    maintainer: <Wrench size={12} />,
    collaborator: <Shield size={12} />,
    viewer: <Eye size={12} />,
};

const roleColors = {
    owner: 'var(--accent-3)',
    maintainer: 'var(--accent-5)',
    collaborator: 'var(--accent-1)',
    viewer: 'var(--text-muted)',
};

const statusColors = {
    'todo': { bg: 'rgba(212, 67, 50, 0.1)', color: '#d44332', border: 'rgba(212, 67, 50, 0.2)' },
    'in-progress': { bg: 'rgba(59, 89, 153, 0.1)', color: '#3b5999', border: 'rgba(59,89,153,0.2)' },
    'done': { bg: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: 'rgba(34,197,94,0.2)' },
};

const statusLabels = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };

export default function ProjectsPage() {
    const [projectsList, setProjectsList] = useState([]);
    const [tab, setTab] = useState('my');
    const [showCreate, setShowCreate] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [joinId, setJoinId] = useState('');
    const [form, setForm] = useState({ title: '', description: '', tags: '', visibility: 'public' });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [currentUser, setCurrentUser] = useState({ id: 'u0', name: 'Sayak M' });
    const [users, setUsers] = useState([]);
    const addToast = useToast();

    useEffect(() => {
        getProjects().then(setProjectsList);
        getCurrentUser().then(setCurrentUser).catch(() => { });
        getUsers().then(setUsers).catch(() => { });
    }, []);

    const handleCreate = async () => {
        if (!form.title.trim()) return;
        const project = await createProject({
            ...form,
            tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        });
        setProjectsList((prev) => [...prev, project]);
        setShowCreate(false);
        setForm({ title: '', description: '', tags: '', visibility: 'public' });
        addToast?.(`Project "${project.title}" created!`, 'success');
    };

    const handleCopyId = (projectId) => {
        navigator.clipboard.writeText(projectId);
        addToast?.(`Copied ${projectId}`, 'success');
    };

    const filteredProjects = projectsList
        .filter(p => {
            if (tab === 'my') return p.members.some(m => m.id === currentUser.id && m.role === 'owner');
            if (tab === 'joined') return p.members.some(m => m.id === currentUser.id && m.role !== 'owner');
            if (tab === 'public') return p.visibility === 'public';
            return true;
        })
        .filter(p =>
            searchQuery === '' ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'progress') return b.progress - a.progress;
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            return 0; // 'recent' — keep original order
        });

    if (selectedProject) {
        return (
            <ProjectDetailView
                project={selectedProject}
                onBack={() => setSelectedProject(null)}
                onUpdate={(updated) => {
                    setProjectsList(prev => prev.map(p => p.id === updated.id ? updated : p));
                    setSelectedProject(updated);
                }}
                addToast={addToast}
                users={users}
                currentUser={currentUser}
            />
        );
    }

    return (
        <div className="projects-page">
            <div className="page-header">
                <h1 className="page-title">Projects</h1>
                <p className="page-subtitle">Collaborate, build, and learn together</p>
            </div>

            {/* Toolbar */}
            <div className="proj-toolbar">
                <div className="proj-tabs">
                    {[
                        { key: 'my', label: 'My Projects' },
                        { key: 'joined', label: 'Joined' },
                        { key: 'public', label: 'Public' },
                    ].map(t => (
                        <button key={t.key} className={`proj-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="proj-toolbar-right">
                    <div className="proj-search-wrap">
                        <Search size={14} />
                        <input
                            placeholder="Search projects or tags..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select className="proj-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="recent">Recent</option>
                        <option value="progress">Progress</option>
                        <option value="name">Name</option>
                    </select>
                    <button className="btn btn-primary proj-create-btn" onClick={() => setShowCreate(true)}>
                        <Plus size={16} /> New Project
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="proj-grid">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="proj-card" onClick={() => setSelectedProject(project)}>
                            <div className="proj-card-header">
                                <div>
                                    <h3 className="proj-card-title">{project.title}</h3>
                                    <div className="proj-card-id" onClick={e => { e.stopPropagation(); handleCopyId(project.projectId); }}>
                                        <Clipboard size={11} /> {project.projectId}
                                    </div>
                                </div>
                                <span className={`proj-visibility-badge ${project.visibility}`}>
                                    {project.visibility === 'public' ? <Globe size={11} /> : <Lock size={11} />}
                                    {project.visibility}
                                </span>
                            </div>
                            <p className="proj-card-desc">{project.description}</p>
                            <div className="proj-card-tags">
                                {project.tags.map(tag => (
                                    <span key={tag} className="proj-tag">{tag}</span>
                                ))}
                            </div>
                            <div className="proj-card-footer">
                                <div className="proj-card-members">
                                    {project.members.slice(0, 4).map(m => {
                                        const u = users.find(u => u.id === m.id);
                                        return <Avatar key={m.id} src={u?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} alt={m.name} size="xs" />;
                                    })}
                                    {project.members.length > 4 && <span className="proj-more-members">+{project.members.length - 4}</span>}
                                </div>
                                <div className="proj-card-stats">
                                    <span className="proj-stat"><CheckCircle2 size={12} /> {project.tasks?.filter(t => t.status === 'done').length || 0}/{project.tasks?.length || 0}</span>
                                </div>
                            </div>
                            <div className="proj-progress-bar">
                                <div className="proj-progress-fill" style={{ width: `${project.progress}%` }} />
                            </div>
                            <div className="proj-progress-text">{project.progress}% complete</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="proj-empty">
                    <FolderKanban size={40} />
                    <h3>No projects found</h3>
                    <p>Create a new project or change your filters</p>
                </div>
            )}

            {/* Join Project Section */}
            <div className="proj-join-section">
                <FrostCard flat>
                    <h3 className="proj-join-title"><Sparkles size={16} /> Join by Project ID</h3>
                    <div className="proj-join-row">
                        <input
                            className="input proj-join-input"
                            placeholder="Enter Project ID (e.g. STU-1234)"
                            value={joinId}
                            onChange={(e) => setJoinId(e.target.value)}
                        />
                        <button
                            className="btn btn-primary"
                            disabled={!joinId.trim()}
                            onClick={() => {
                                addToast?.(`Request sent to join ${joinId}`, 'info');
                                setJoinId('');
                            }}
                        >
                            Request Join
                        </button>
                    </div>
                </FrostCard>
            </div>

            {/* Create Project Modal */}
            <Modal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                title="Create New Project"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleCreate} disabled={!form.title.trim()}>Create</button>
                    </>
                }
            >
                <div className="settings-field">
                    <label className="settings-label">Project Title *</label>
                    <input className="input" placeholder="My Awesome Project" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="settings-field">
                    <label className="settings-label">Description</label>
                    <textarea className="settings-textarea" placeholder="What's this project about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="settings-field">
                    <label className="settings-label">Tags (comma-separated)</label>
                    <input className="input" placeholder="React, Machine Learning, Physics" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                </div>
                <div className="settings-field">
                    <label className="settings-label">Visibility</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className={`btn btn-sm ${form.visibility === 'public' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setForm({ ...form, visibility: 'public' })}><Globe size={13} /> Public</button>
                        <button className={`btn btn-sm ${form.visibility === 'private' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setForm({ ...form, visibility: 'private' })}><Lock size={13} /> Private</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

/* ═══ Project Detail View ═══ */
function ProjectDetailView({ project, onBack, onUpdate, addToast, users, currentUser }) {
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
    const [showAddTask, setShowAddTask] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteUser, setInviteUser] = useState('');
    const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', deadline: '', status: 'todo' });
    const [editingTask, setEditingTask] = useState(null);

    const tasks = project.tasks || [];
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const doneTasks = tasks.filter(t => t.status === 'done');
    const completedCount = doneTasks.length;
    const totalCount = tasks.length;
    const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done');

    const isOwner = project.members.some(m => m.id === currentUser.id && m.role === 'owner');

    const addTask = async () => {
        if (!taskForm.title.trim()) return;
        try {
            const updated = await createProjectTask(project.id, {
                title: taskForm.title,
                description: taskForm.description,
                assignee: taskForm.assignee || currentUser.id,
                deadline: taskForm.deadline || null,
                status: taskForm.status,
            });
            onUpdate(updated);
            setTaskForm({ title: '', description: '', assignee: '', deadline: '', status: 'todo' });
            setShowAddTask(false);
            addToast?.('Task created', 'success');
        } catch {
            addToast?.('Failed to create task', 'error');
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const updated = await updateProjectTask(project.id, taskId, { status: newStatus });
            onUpdate(updated);
            addToast?.(`Task moved to ${statusLabels[newStatus]}`, 'success');
        } catch {
            addToast?.('Failed to update task', 'error');
        }
    };

    const deleteTask = async (taskId) => {
        try {
            const updated = await deleteProjectTask(project.id, taskId);
            onUpdate(updated);
            addToast?.('Task deleted', 'success');
        } catch {
            addToast?.('Failed to delete task', 'error');
        }
    };

    const handleInvite = () => {
        if (!inviteUser.trim()) return;
        addToast?.(`Invite sent to ${inviteUser}`, 'success');
        setInviteUser('');
        setShowInvite(false);
    };

    const removeMember = async (memberId) => {
        if (!isOwner || memberId === currentUser.id) return;
        try {
            const updated = await removeProjectMember(project.id, memberId);
            onUpdate(updated);
            addToast?.('Member removed', 'success');
        } catch {
            addToast?.('Failed to remove member', 'error');
        }
    };

    return (
        <div className="proj-detail">
            <button className="proj-back-btn" onClick={onBack}>
                <ChevronLeft size={16} /> Back to Projects
            </button>

            {/* Project Header */}
            <div className="proj-detail-header">
                <div className="proj-detail-info">
                    <h1 className="proj-detail-title">{project.title}</h1>
                    <div className="proj-detail-meta">
                        <span className="proj-detail-id" onClick={() => { navigator.clipboard.writeText(project.projectId); addToast?.('Copied!', 'success'); }}>
                            <Copy size={12} /> {project.projectId}
                        </span>
                        <span className={`proj-visibility-badge ${project.visibility}`}>
                            {project.visibility === 'public' ? <Globe size={11} /> : <Lock size={11} />}
                            {project.visibility}
                        </span>
                        <span className="proj-status-badge active">Active</span>
                    </div>
                    <p className="proj-detail-desc">{project.description}</p>
                </div>
                <div className="proj-detail-actions">
                    <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
                        <UserPlus size={15} /> Invite
                    </button>
                    <button className="btn btn-secondary" onClick={() => addToast?.('Opening workspace...', 'info')}>
                        <ExternalLink size={15} /> Open Workspace
                    </button>
                    {!isOwner && (
                        <button className="btn btn-ghost" onClick={() => addToast?.('Left project', 'info')}>
                            <LeaveIcon size={15} /> Leave
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="proj-stats-row">
                <div className="proj-stat-card">
                    <div className="proj-stat-icon"><BarChart3 size={18} /></div>
                    <div>
                        <div className="proj-stat-value">{project.progress}%</div>
                        <div className="proj-stat-label">Progress</div>
                    </div>
                    <div className="proj-mini-progress">
                        <div className="proj-mini-fill" style={{ width: `${project.progress}%` }} />
                    </div>
                </div>
                <div className="proj-stat-card">
                    <div className="proj-stat-icon"><CheckCircle2 size={18} /></div>
                    <div>
                        <div className="proj-stat-value">{completedCount}/{totalCount}</div>
                        <div className="proj-stat-label">Tasks Done</div>
                    </div>
                </div>
                <div className="proj-stat-card">
                    <div className="proj-stat-icon"><Users size={18} /></div>
                    <div>
                        <div className="proj-stat-value">{project.members.length}</div>
                        <div className="proj-stat-label">Members</div>
                    </div>
                </div>
                {overdueTasks.length > 0 && (
                    <div className="proj-stat-card overdue">
                        <div className="proj-stat-icon"><AlertCircle size={18} /></div>
                        <div>
                            <div className="proj-stat-value">{overdueTasks.length}</div>
                            <div className="proj-stat-label">Overdue</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Members Section */}
            <div className="proj-section">
                <div className="proj-section-header">
                    <h3><Users size={16} /> Members</h3>
                    <button className="btn btn-sm btn-secondary" onClick={() => setShowInvite(true)}>
                        <UserPlus size={13} /> Invite
                    </button>
                </div>
                <div className="proj-members-grid">
                    {project.members.map(m => {
                        const u = users.find(u => u.id === m.id);
                        return (
                            <div key={m.id} className="proj-member-card">
                                <Avatar src={u?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} alt={m.name} size="sm" online={u?.online} />
                                <div className="proj-member-info">
                                    <span className="proj-member-name">{m.name}</span>
                                    <span className="proj-member-role" style={{ color: roleColors[m.role] }}>
                                        {roleIcons[m.role]} {m.role}
                                    </span>
                                </div>
                                {isOwner && m.id !== currentUser.id && (
                                    <button className="btn-icon-sm proj-member-remove" onClick={() => removeMember(m.id)} title="Remove member">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Task Board */}
            <div className="proj-section">
                <div className="proj-section-header">
                    <h3><FolderKanban size={16} /> Task Board</h3>
                    <div className="proj-task-controls">
                        <div className="proj-view-toggle">
                            <button className={`proj-view-btn ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')}>
                                <FolderKanban size={14} />
                            </button>
                            <button className={`proj-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                                <ListFilter size={14} />
                            </button>
                        </div>
                        <button className="btn btn-sm btn-primary" onClick={() => setShowAddTask(true)}>
                            <Plus size={13} /> Add Task
                        </button>
                    </div>
                </div>

                {viewMode === 'kanban' ? (
                    <div className="proj-kanban">
                        {['todo', 'in-progress', 'done'].map(status => {
                            const col = status === 'todo' ? todoTasks : status === 'in-progress' ? inProgressTasks : doneTasks;
                            return (
                                <div key={status} className="proj-kanban-col">
                                    <div className="proj-kanban-header" style={{ borderColor: statusColors[status].border }}>
                                        <span className="proj-kanban-dot" style={{ background: statusColors[status].color }} />
                                        <span>{statusLabels[status]}</span>
                                        <span className="proj-kanban-count">{col.length}</span>
                                    </div>
                                    <div className="proj-kanban-body">
                                        {col.map(task => (
                                            <TaskCard key={task.id} task={task} onStatusChange={updateTaskStatus} onDelete={deleteTask} isOwner={isOwner} users={users} />
                                        ))}
                                        {col.length === 0 && <div className="proj-kanban-empty">No tasks</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="proj-task-list">
                        {tasks.map(task => {
                            const u = users.find(u => u.id === task.assignee);
                            return (
                                <div key={task.id} className="proj-task-row">
                                    <span className="proj-task-status-dot" style={{ background: statusColors[task.status]?.color }} />
                                    <span className="proj-task-title">{task.title}</span>
                                    {u && <Avatar src={u.avatar} alt={u.name} size="xs" />}
                                    <span className="proj-task-status-label" style={{ color: statusColors[task.status]?.color, background: statusColors[task.status]?.bg }}>
                                        {statusLabels[task.status]}
                                    </span>
                                    <select
                                        className="proj-task-status-select"
                                        value={task.status}
                                        onChange={e => updateTaskStatus(task.id, e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                    {isOwner && (
                                        <button className="btn-icon-sm" onClick={() => deleteTask(task.id)}>
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {tasks.length === 0 && <div className="proj-kanban-empty" style={{ padding: 30 }}>No tasks yet. Add one!</div>}
                    </div>
                )}
            </div>

            {/* Activity Log */}
            {project.activity && project.activity.length > 0 && (
                <div className="proj-section">
                    <div className="proj-section-header">
                        <h3><Activity size={16} /> Activity</h3>
                    </div>
                    <div className="proj-activity-feed">
                        {project.activity.slice(0, 10).map((a, i) => (
                            <div key={i} className="proj-activity-item">
                                <div className="proj-activity-dot" />
                                <div className="proj-activity-content">
                                    <span className="proj-activity-text">{a.text}</span>
                                    <span className="proj-activity-time">
                                        {new Date(a.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Task Modal */}
            <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Add New Task"
                footer={<><button className="btn btn-secondary" onClick={() => setShowAddTask(false)}>Cancel</button><button className="btn btn-primary" onClick={addTask} disabled={!taskForm.title.trim()}>Add Task</button></>}
            >
                <div className="settings-field">
                    <label className="settings-label">Task Title *</label>
                    <input className="input" placeholder="What needs to be done?" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                </div>
                <div className="settings-field">
                    <label className="settings-label">Description</label>
                    <textarea className="settings-textarea" placeholder="Task details..." value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                </div>
                <div className="settings-field">
                    <label className="settings-label">Assign To</label>
                    <select className="input" value={taskForm.assignee} onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })}>
                        <option value="">Select member</option>
                        {project.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="settings-field" style={{ flex: 1 }}>
                        <label className="settings-label">Deadline</label>
                        <input className="input" type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                    </div>
                    <div className="settings-field" style={{ flex: 1 }}>
                        <label className="settings-label">Status</label>
                        <select className="input" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Invite Modal */}
            <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite to Project"
                footer={<><button className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button><button className="btn btn-primary" onClick={handleInvite} disabled={!inviteUser.trim()}>Send Invite</button></>}
            >
                <div className="settings-field">
                    <label className="settings-label">Username or User ID</label>
                    <input className="input" placeholder="Enter username or ID" value={inviteUser} onChange={e => setInviteUser(e.target.value)} />
                </div>
                <div className="proj-invite-id-section">
                    <span className="settings-label">Or share the Project ID:</span>
                    <div className="proj-share-id-row" onClick={() => { navigator.clipboard.writeText(project.projectId); addToast?.('Copied!', 'success'); }}>
                        <code>{project.projectId}</code>
                        <Copy size={14} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

/* ═══ Task Card for Kanban ═══ */
function TaskCard({ task, onStatusChange, onDelete, isOwner, users }) {
    const [showMenu, setShowMenu] = useState(false);
    const u = users.find(u => u.id === task.assignee);
    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

    return (
        <div className={`proj-task-card ${isOverdue ? 'overdue' : ''}`}>
            <div className="proj-task-card-header">
                <span className="proj-task-card-title">{task.title}</span>
                <button className="btn-icon-sm" onClick={() => setShowMenu(!showMenu)}>
                    <MoreVertical size={14} />
                </button>
            </div>
            {task.description && <p className="proj-task-card-desc">{task.description}</p>}
            <div className="proj-task-card-footer">
                {u && (
                    <div className="proj-task-assignee">
                        <Avatar src={u.avatar} alt={u.name} size="xs" />
                        <span>{u.name.split(' ')[0]}</span>
                    </div>
                )}
                {task.deadline && (
                    <span className={`proj-task-deadline ${isOverdue ? 'overdue' : ''}`}>
                        <Calendar size={11} /> {new Date(task.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                )}
            </div>
            {showMenu && (
                <div className="proj-task-menu" onClick={e => e.stopPropagation()}>
                    {task.status !== 'todo' && <button onClick={() => { onStatusChange(task.id, 'todo'); setShowMenu(false); }}>→ To Do</button>}
                    {task.status !== 'in-progress' && <button onClick={() => { onStatusChange(task.id, 'in-progress'); setShowMenu(false); }}>→ In Progress</button>}
                    {task.status !== 'done' && <button onClick={() => { onStatusChange(task.id, 'done'); setShowMenu(false); }}>→ Done</button>}
                    {isOwner && <><div className="proj-task-menu-divider" /><button className="danger" onClick={() => { onDelete(task.id); setShowMenu(false); }}>Delete</button></>}
                </div>
            )}
        </div>
    );
}
