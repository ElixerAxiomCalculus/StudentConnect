import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Users, Plus, Search, Lock, Globe, Crown,
    LogOut as LeaveIcon, UserPlus, X, ChevronLeft,
    BookOpen, FolderKanban, Heart, Sparkles, Check,
    Filter, Send, Wifi, WifiOff, MoreVertical,
    Hash, Bell, BellOff, Pin, Info, Settings, Smile,
    AtSign, Image as ImageIcon, Paperclip
} from 'lucide-react';
import FrostCard from '../components/FrostCard';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import {
    getGroups, createGroup, joinGroup, leaveGroup, getCurrentUser,
    getMessages, sendMessage, getChatSocketUrl
} from '../data/api';

/* ── Constants ── */
const CATEGORY_META = {
    study:   { label: 'Study',   icon: <BookOpen size={14} />,     bg: 'rgba(59,89,153,0.12)',  color: '#3b5999' },
    club:    { label: 'Club',    icon: <Users size={14} />,        bg: 'rgba(212,67,50,0.12)',  color: '#d44332' },
    project: { label: 'Project', icon: <FolderKanban size={14} />, bg: 'rgba(0,128,178,0.12)', color: '#0080b2' },
    social:  { label: 'Social',  icon: <Heart size={14} />,        bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
};

const TABS = [
    { id: 'all',      label: 'All Groups' },
    { id: 'my',       label: 'My Groups' },
    { id: 'discover', label: 'Discover' },
    { id: 'invited',  label: 'Invitations' },
];

function makeWelcomeMessage(groupName) {
    return [
        { id: 'sys0', senderId: '__sys__', text: `Welcome to ${groupName}! This is the beginning of the group chat.`, time: new Date().toISOString(), isSystem: true },
    ];
}

function formatMsgTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffH = diffMs / 3600000;
    if (diffH < 24) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (diffH < 48) return 'Yesterday ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/* ══════════════════════════════════════
   GROUP CHAT VIEW (full page)
   ══════════════════════════════════════ */
function GroupChatView({ group, currentUser, onBack, addToast }) {
    const [messages, setMessages]   = useState([]);
    const [input, setInput]         = useState('');
    const [loading, setLoading]     = useState(true);
    const [wsStatus, setWsStatus]   = useState('connecting');
    const [showMembers, setShowMembers] = useState(true);
    const [muted, setMuted]         = useState(false);
    const [pinned, setPinned]       = useState([]);
    const wsRef          = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef       = useRef(null);
    const threadId       = group.threadId || `group_${group.id}`;
    const meta           = CATEGORY_META[group.category] || CATEGORY_META.study;

    /* Load history + connect WS */
    useEffect(() => {
        setLoading(true);
        if (!group.threadId) {
            // No chat thread exists for this group
            setMessages(makeWelcomeMessage(group.name));
            setLoading(false);
            setWsStatus('offline');
            return;
        }

        getMessages(threadId)
            .then(data => {
                const msgs = Array.isArray(data) && data.length > 0
                    ? data.map(m => ({
                        id: m.id || m._id,
                        senderId: m.senderId || m.sender_id,
                        senderName: m.senderName || '',
                        text: m.text,
                        time: m.time,
                        avatar: m.avatar || '',
                    }))
                    : makeWelcomeMessage(group.name);
                setMessages(msgs);
                setLoading(false);
            })
            .catch(() => {
                setMessages(makeWelcomeMessage(group.name));
                setLoading(false);
            });

        try {
            const url = getChatSocketUrl(threadId, currentUser?.id || 'u0');
            const ws  = new WebSocket(url);
            wsRef.current = ws;
            ws.onopen  = () => setWsStatus('connected');
            ws.onerror = () => setWsStatus('offline');
            ws.onclose = () => setWsStatus('offline');
            ws.onmessage = (evt) => {
                try {
                    const data = JSON.parse(evt.data);
                    if (data.type === 'message_created' && data.payload) {
                        const msg = data.payload;
                        setMessages(prev => {
                            if (prev.some(m => m.id === msg.id)) return prev;
                            return [...prev, {
                                id: msg.id,
                                senderId: msg.senderId,
                                senderName: msg.senderName || '',
                                text: msg.text,
                                time: msg.time,
                                avatar: msg.avatar || '',
                                own: msg.senderId === currentUser?.id,
                            }];
                        });
                    }
                } catch { }
            };
        } catch {
            setWsStatus('offline');
        }

        return () => { wsRef.current?.close(); };
    }, [group.id, group.threadId]);

    /* Auto-scroll */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = useCallback(async () => {
        if (!input.trim()) return;
        const text = input.trim();
        setInput('');

        const msg = {
            id: `local_${Date.now()}`,
            senderId: currentUser?.id || 'u0',
            senderName: currentUser?.name || 'You',
            avatar: currentUser?.avatar || '',
            text,
            time: new Date().toISOString(),
            own: true,
        };
        setMessages(prev => [...prev, msg]);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ text }));
        } else {
            try { await sendMessage(threadId, text); } catch { }
        }
    }, [input, currentUser, threadId]);

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    /* Member count display (real member data comes from group.memberIds) */
    const memberCount = group.members || 0;

    return (
        <div className="group-chat-view">
            {/* ── Header ── */}
            <div className="group-chat-header">
                <button className="group-chat-back" onClick={onBack}>
                    <ChevronLeft size={18} />
                </button>

                <div className="group-chat-header-center">
                    <div className="group-cat-badge" style={{ background: meta.bg, color: meta.color, fontSize: '0.7rem', padding: '3px 8px' }}>
                        {meta.icon} {meta.label}
                    </div>
                    <div>
                        <h2 className="group-chat-title">{group.name}</h2>
                        <span className="group-chat-subtitle">
                            <span className={`group-ws-dot ${wsStatus}`} />
                            {group.members} members ·{' '}
                            {wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting…' : 'Offline mode'}
                        </span>
                    </div>
                </div>

                <div className="group-chat-header-actions">
                    <button
                        className={`group-chat-icon-btn ${muted ? 'active' : ''}`}
                        onClick={() => { setMuted(m => !m); addToast?.(muted ? 'Notifications on' : 'Muted', 'success'); }}
                        title={muted ? 'Unmute' : 'Mute'}
                    >
                        {muted ? <BellOff size={16} /> : <Bell size={16} />}
                    </button>
                    <button
                        className={`group-chat-icon-btn ${showMembers ? 'active' : ''}`}
                        onClick={() => setShowMembers(s => !s)}
                        title="Toggle members"
                    >
                        <Users size={16} />
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="group-chat-body">
                {/* Messages */}
                <div className="group-chat-messages">
                    {loading ? (
                        <div className="group-chat-loading">
                            <div className="home-spinner" /> Loading messages…
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => {
                                const isOwn = msg.own || msg.senderId === (currentUser?.id || 'u0');
                                const isSystem = msg.isSystem || msg.senderId === '__sys__';
                                const prevMsg = messages[idx - 1];
                                const showAvatar = !isOwn && !isSystem && (!prevMsg || prevMsg.senderId !== msg.senderId);

                                if (isSystem) {
                                    return (
                                        <div key={msg.id} className="group-msg-system">
                                            <span>{msg.text}</span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={msg.id} className={`group-msg-row ${isOwn ? 'own' : 'other'}`}>
                                        {!isOwn && (
                                            <div className="group-msg-avatar-wrap">
                                                {showAvatar
                                                    ? <Avatar src={msg.avatar} alt={msg.senderName} size="xs" />
                                                    : <div style={{ width: 28 }} />
                                                }
                                            </div>
                                        )}
                                        <div className="group-msg-content">
                                            {showAvatar && !isOwn && (
                                                <span className="group-msg-sender">{msg.senderName}</span>
                                            )}
                                            <div className="group-msg-bubble">
                                                <span className="group-msg-text">{msg.text}</span>
                                            </div>
                                            <span className="group-msg-time">{formatMsgTime(msg.time)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Members Panel */}
                {showMembers && (
                    <div className="group-chat-members-panel">
                        <div className="group-members-panel-header">
                            <h4><Users size={14} /> Members ({memberCount})</h4>
                        </div>
                        <div className="group-members-list">
                            {/* Current user */}
                            <div className="group-member-row you">
                                <Avatar src={currentUser?.avatar} alt="You" size="xs" online />
                                <div className="group-member-info">
                                    <span className="group-member-name">You</span>
                                    <span className="group-member-status online">Online</span>
                                </div>
                            </div>
                            {memberCount > 1 && (
                                <div className="group-member-row">
                                    <div className="group-member-info">
                                        <span className="group-member-name" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                            +{memberCount - 1} other member{memberCount > 2 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="group-members-panel-footer">
                            <button className="btn btn-sm btn-ghost" style={{ width: '100%', fontSize: '0.72rem' }}>
                                <UserPlus size={12} /> Invite to Group
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Input ── */}
            <div className="group-chat-input-area">
                {wsStatus === 'offline' && (
                    <div className="group-chat-offline-banner">
                        <WifiOff size={13} /> Backend offline — messages saved locally only
                    </div>
                )}
                <div className="group-chat-input-row">
                    <div className="group-chat-input-wrap">
                        <textarea
                            ref={inputRef}
                            className="group-chat-textarea"
                            placeholder={`Message ${group.name}…`}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            rows={1}
                        />
                    </div>
                    <button
                        className="group-chat-send-btn"
                        onClick={handleSend}
                        disabled={!input.trim()}
                        aria-label="Send"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="group-chat-input-hint">
                    Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════
   GROUP CARD
   ══════════════════════════════════════ */
function GroupCard({ group, currentUserId, onJoin, onLeave, onOpen }) {
    const meta    = CATEGORY_META[group.category] || CATEGORY_META.study;
    const isOwner = group.ownerId === currentUserId;

    return (
        <div className="group-card frost-card" style={{ cursor: 'pointer' }} onClick={() => onOpen(group)}>
            <div className="group-card-header">
                <div className="group-cat-badge" style={{ background: meta.bg, color: meta.color }}>
                    {meta.icon} {meta.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {group.visibility === 'private'
                        ? <Lock size={13} color="var(--text-muted)" />
                        : <Globe size={13} color="var(--text-muted)" />}
                    {group.joined && (
                        <span style={{ fontSize: '0.62rem', background: 'rgba(34,197,94,0.12)', color: '#16a34a', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>
                            Joined
                        </span>
                    )}
                    {group.invited && !group.joined && (
                        <span className="badge badge-info" style={{ fontSize: '0.62rem' }}>Invited</span>
                    )}
                </div>
            </div>

            <h3 className="group-card-name">{group.name}</h3>
            <p className="group-card-desc">{group.description || 'No description provided.'}</p>

            <div className="group-tags">
                {group.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="group-tag">{tag}</span>
                ))}
            </div>

            <div className="group-card-footer">
                <span className="group-member-count">
                    <Users size={13} /> {group.members} member{group.members !== 1 ? 's' : ''}
                </span>
                {group.joined ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={e => { e.stopPropagation(); onOpen(group); }}
                        >
                            <Hash size={12} /> Chat
                        </button>
                        {!isOwner && (
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={e => { e.stopPropagation(); onLeave(group.id); }}
                            >
                                <LeaveIcon size={12} />
                            </button>
                        )}
                    </div>
                ) : group.invited ? (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={e => { e.stopPropagation(); onJoin(group.id); }}
                    >
                        <Check size={13} /> Accept
                    </button>
                ) : (
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={e => { e.stopPropagation(); onJoin(group.id); }}
                    >
                        <UserPlus size={13} /> Join
                    </button>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════
   GROUP DETAIL MODAL (non-joined)
   ══════════════════════════════════════ */
function GroupDetailModal({ group, onClose, onJoin, onLeave, currentUserId }) {
    if (!group) return null;
    const meta = CATEGORY_META[group.category] || CATEGORY_META.study;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="group-cat-badge" style={{ background: meta.bg, color: meta.color }}>
                            {meta.icon} {meta.label}
                        </div>
                        <h2 className="modal-title">{group.name}</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body">
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        {group.description || 'No description provided.'}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {group.tags?.map(tag => (
                            <span key={tag} className="group-tag">{tag}</span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Users size={13} /> {group.members} member{group.members !== 1 ? 's' : ''}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            {group.visibility === 'private' ? <Lock size={13} /> : <Globe size={13} />}
                            {group.visibility === 'private' ? 'Private' : 'Public'}
                        </span>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    {group.joined ? (
                        group.ownerId !== currentUserId && (
                            <button className="btn btn-primary" style={{ background: 'var(--danger)' }}
                                onClick={() => { onLeave(group.id); onClose(); }}>
                                <LeaveIcon size={14} /> Leave Group
                            </button>
                        )
                    ) : (
                        <button className="btn btn-primary"
                            onClick={() => { onJoin(group.id); onClose(); }}>
                            <UserPlus size={14} /> {group.invited ? 'Accept Invitation' : 'Join Group'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════
   MAIN GROUPS PAGE
   ══════════════════════════════════════ */
export default function GroupsPage() {
    const [groups, setGroups]           = useState([]);
    const [tab, setTab]                 = useState('all');
    const [search, setSearch]           = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showCreate, setShowCreate]   = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [openChatGroup, setOpenChatGroup] = useState(null); // joined group chat
    const [currentUser, setCurrentUser] = useState({ id: 'u0' });
    const [form, setForm] = useState({ name: '', description: '', category: 'study', visibility: 'public', tags: '' });
    const addToast = useToast();

    useEffect(() => {
        getGroups().then(setGroups).catch(() => { });
        getCurrentUser().then(setCurrentUser).catch(() => { });
    }, []);

    /* Route: joined groups → chat view; others → detail modal */
    const handleOpen = (group) => {
        if (group.joined) {
            setOpenChatGroup(group);
        } else {
            setSelectedGroup(group);
        }
    };

    const filtered = groups.filter(g => {
        if (tab === 'my')       return g.joined;
        if (tab === 'discover') return !g.joined;
        if (tab === 'invited')  return g.invited;
        return true;
    }).filter(g => {
        const q = search.toLowerCase();
        return !q || g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q);
    }).filter(g => categoryFilter === 'all' || g.category === categoryFilter);

    const handleJoin = async (groupId) => {
        try {
            const updated = await joinGroup(groupId);
            if (Array.isArray(updated)) {
                setGroups(updated);
            } else {
                setGroups(prev => prev.map(g => g.id === groupId ? { ...g, joined: true, members: g.members + 1 } : g));
            }
            addToast?.('Joined group!', 'success');
        } catch {
            addToast?.('Failed to join group', 'error');
        }
    };

    const handleLeave = async (groupId) => {
        try {
            await leaveGroup(groupId);
            setGroups(prev => prev.map(g => g.id === groupId ? { ...g, joined: false, members: Math.max(0, g.members - 1) } : g));
            addToast?.('Left group', 'success');
        } catch {
            addToast?.('Failed to leave group', 'error');
        }
    };

    const handleCreate = async () => {
        if (!form.name.trim()) return;
        try {
            const group = await createGroup({
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            setGroups(prev => [group, ...prev]);
            setShowCreate(false);
            setForm({ name: '', description: '', category: 'study', visibility: 'public', tags: '' });
            addToast?.(`Group "${group.name}" created!`, 'success');
        } catch {
            addToast?.('Failed to create group', 'error');
        }
    };

    const invitedCount = groups.filter(g => g.invited && !g.joined).length;

    /* ── If a joined group chat is open, show full chat view ── */
    if (openChatGroup) {
        return (
            <GroupChatView
                group={openChatGroup}
                currentUser={currentUser}
                onBack={() => setOpenChatGroup(null)}
                addToast={addToast}
            />
        );
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 className="page-title">Groups</h1>
                    <p className="page-subtitle">Connect with communities that share your interests</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <Plus size={16} /> New Group
                </button>
            </div>

            {/* Stats row */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Groups', value: groups.length,                          icon: <Users size={20} />,   cls: 'icon-projects' },
                    { label: 'My Groups',    value: groups.filter(g => g.joined).length,    icon: <Crown size={20} />,   cls: 'icon-matches' },
                    { label: 'Invitations', value: invitedCount,                            icon: <Sparkles size={20} />, cls: 'icon-requests' },
                    { label: 'Discover',    value: groups.filter(g => !g.joined).length,    icon: <Globe size={20} />,   cls: 'icon-mentions' },
                ].map(({ label, value, icon, cls }) => (
                    <FrostCard key={label} style={{ padding: 0 }}>
                        <div className="stat-card">
                            <div className={`stat-icon ${cls}`}>{icon}</div>
                            <div className="stat-info">
                                <div className="stat-value">{value}</div>
                                <div className="stat-label">{label}</div>
                            </div>
                        </div>
                    </FrostCard>
                ))}
            </div>

            {/* Search + Category filter */}
            <FrostCard flat style={{ marginBottom: 20, padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            style={{ paddingLeft: 32 }}
                            placeholder="Search groups…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Filter size={14} color="var(--text-muted)" />
                        {['all', 'study', 'club', 'project', 'social'].map(cat => (
                            <button
                                key={cat}
                                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setCategoryFilter(cat)}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {cat === 'all' ? 'All' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </FrostCard>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {TABS.map(t => (
                    <button
                        key={t.id}
                        className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setTab(t.id)}
                    >
                        {t.label}
                        {t.id === 'invited' && invitedCount > 0 && (
                            <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: '0.6rem', minWidth: 16, height: 16 }}>
                                {invitedCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Group grid */}
            {filtered.length === 0 ? (
                <FrostCard flat>
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                        <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
                        <p style={{ margin: 0, fontSize: '0.92rem' }}>
                            {tab === 'invited'  ? 'No pending invitations' :
                             tab === 'my'       ? 'You have not joined any groups yet' :
                             search             ? `No groups matching "${search}"` : 'No groups found'}
                        </p>
                        {tab !== 'invited' && (
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
                                <Plus size={14} /> Create one
                            </button>
                        )}
                    </div>
                </FrostCard>
            ) : (
                <div className="groups-grid">
                    {filtered.map(group => (
                        <GroupCard
                            key={group.id}
                            group={group}
                            currentUserId={currentUser.id}
                            onJoin={handleJoin}
                            onLeave={handleLeave}
                            onOpen={handleOpen}
                        />
                    ))}
                </div>
            )}

            {/* Create Group Modal */}
            {showCreate && (
                <Modal title="Create Group" onClose={() => setShowCreate(false)}>
                    <div className="modal-body">
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Group Name *</label>
                            <input
                                className="input"
                                style={{ marginTop: 6 }}
                                placeholder="e.g. AI/ML Reading Circle"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Description</label>
                            <textarea
                                className="input"
                                style={{ marginTop: 6, resize: 'vertical', minHeight: 72 }}
                                placeholder="What is this group about?"
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category</label>
                                <select className="input" style={{ marginTop: 6 }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                    <option value="study">Study</option>
                                    <option value="club">Club</option>
                                    <option value="project">Project</option>
                                    <option value="social">Social</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Visibility</label>
                                <select className="input" style={{ marginTop: 6 }} value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tags</label>
                            <input
                                className="input"
                                style={{ marginTop: 6 }}
                                placeholder="React, Python, Machine Learning (comma-separated)"
                                value={form.tags}
                                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleCreate} disabled={!form.name.trim()}>
                            <Plus size={14} /> Create Group
                        </button>
                    </div>
                </Modal>
            )}

            {/* Detail modal for non-joined groups */}
            {selectedGroup && (
                <GroupDetailModal
                    group={selectedGroup}
                    currentUserId={currentUser.id}
                    onClose={() => setSelectedGroup(null)}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                />
            )}
        </div>
    );
}
