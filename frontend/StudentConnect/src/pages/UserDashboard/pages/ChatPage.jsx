import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Send, Smile, Paperclip, Check, CheckCheck, UserPlus, UserX,
    Phone, Video, MoreVertical, Search, ArrowLeft, Mic, Image,
    Settings, X, Clock, Shield, Palette, Trash2, Bell, BellOff,
    Star, Pin, Copy, Forward, ChevronRight, Info, MapPin,
    BookOpen, Mail, Calendar, Heart, Edit3, Archive, Ban,
    FolderKanban, Upload, Download, FileText, MessageCircle
} from 'lucide-react';
import gsap from 'gsap';
import Avatar from '../components/Avatar';
import SearchInput from '../components/SearchInput';
import { useToast } from '../components/Toast';
import { getChatThreads, getMessages, sendMessage, getCurrentUser, getUsers } from '../data/api';

function formatChatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatThreadTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000 / 60 / 60;
    if (diff < 24) return formatChatTime(iso);
    if (diff < 48) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

const chatBgPresets = [
    { name: 'Default', value: 'transparent' },
    { name: 'Warm Peach', value: 'rgba(255,235,230,0.35)' },
    { name: 'Cool Blue', value: 'rgba(220,235,255,0.35)' },
    { name: 'Mint Green', value: 'rgba(220,255,235,0.35)' },
    { name: 'Lavender', value: 'rgba(240,225,255,0.35)' },
    { name: 'Sunset', value: 'rgba(255,230,200,0.35)' },
];

const quickEmojis = ['😀', '😂', '❤️', '👍', '👎', '🔥', '🎉', '😢', '😮', '🤔', '😡', '🙏',
    '✨', '💯', '🚀', '👀', '💪', '🥳', '😎', '🤝', '💡', '⭐', '☕', '🎯'];

const reactionEmojis = ['❤️', '😂', '👍', '😮', '🔥', '😢'];

export default function ChatPage() {
    const [threads, setThreads] = useState([]);
    const [activeThread, setActiveThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showChatSettings, setShowChatSettings] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [chatBgs, setChatBgs] = useState({});
    const [disappearing, setDisappearing] = useState({});
    const [muted, setMuted] = useState({});
    const [pinned, setPinned] = useState({});
    const [starred, setStarred] = useState({});
    const [showSearch, setShowSearch] = useState(false);
    const [chatSearch, setChatSearch] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [reactions, setReactions] = useState({});
    const [contextMenu, setContextMenu] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null);
    const [editText, setEditText] = useState('');
    const [archived, setArchived] = useState({});
    const [dragOver, setDragOver] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [currentUser, setCurrentUser] = useState({ id: 'u0', name: 'You', avatar: '' });
    const [users, setUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const chatMainRef = useRef(null);
    const profileRef = useRef(null);
    const settingsRef = useRef(null);
    const inputRef = useRef(null);
    const addToast = useToast();

    useEffect(() => {
        getChatThreads().then(setThreads);
        getCurrentUser().then(setCurrentUser).catch(() => { });
        getUsers().then(setUsers).catch(() => { });
    }, []);

    useEffect(() => {
        if (activeThread) {
            getMessages(activeThread.threadId).then(setMessages);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [activeThread]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (profileRef.current) {
            gsap.fromTo(profileRef.current,
                { x: 320, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
            );
        }
    }, [showProfile]);

    useEffect(() => {
        if (settingsRef.current && showChatSettings) {
            gsap.fromTo(settingsRef.current,
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
        }
    }, [showChatSettings]);

    // Close context menu on outside click
    useEffect(() => {
        const handler = () => setContextMenu(null);
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || !activeThread) return;
        const text = input.trim();
        const msg = await sendMessage(activeThread.threadId, text);
        // If we have attachments, add them to the message
        if (attachments.length > 0) {
            msg.attachments = [...attachments];
            setAttachments([]);
        }
        setMessages((prev) => [...prev, msg]);
        setInput('');
        setShowEmoji(false);
        setTyping(true);
        // simulateReply(activeThread.threadId, (reply) => {
        //     setTyping(false);
        //     setMessages((prev) => [...prev, reply]);
        // });
        setTimeout(() => setTyping(false), 6000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAcceptRequest = (thread) => {
        setThreads((prev) =>
            prev.map((t) =>
                t.threadId === thread.threadId ? { ...t, type: 'personal' } : t
            )
        );
        addToast?.(`Accepted friend request from ${thread.name}`, 'success');
    };

    const handleVoiceNote = () => {
        if (isRecording) {
            setIsRecording(false);
            addToast?.('Voice note recorded (0:03)', 'success');
            const voiceMsg = {
                id: `voice-${Date.now()}`,
                senderId: currentUser.id,
                text: '🎤 Voice note (0:03)',
                time: new Date().toISOString(),
                status: 'delivered',
                type: 'voice',
            };
            setMessages((prev) => [...prev, voiceMsg]);
        } else {
            setIsRecording(true);
            addToast?.('Recording...', 'info');
            setTimeout(() => setIsRecording(false), 3000);
        }
    };

    const togglePin = (threadId) => {
        setPinned(p => ({ ...p, [threadId]: !p[threadId] }));
        addToast?.(pinned[threadId] ? 'Unpinned chat' : 'Chat pinned', 'success');
    };

    const toggleMute = (threadId) => {
        setMuted(m => ({ ...m, [threadId]: !m[threadId] }));
        addToast?.(muted[threadId] ? 'Unmuted' : 'Chat muted', 'success');
    };

    const toggleStar = (msgId) => {
        setStarred(s => ({ ...s, [msgId]: !s[msgId] }));
    };

    const addReaction = (msgId, emoji) => {
        setReactions(r => {
            const msgReactions = r[msgId] || {};
            const count = msgReactions[emoji] || 0;
            return { ...r, [msgId]: { ...msgReactions, [emoji]: count ? 0 : 1 } };
        });
        setContextMenu(null);
    };

    const deleteMessage = (msgId) => {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        setContextMenu(null);
        addToast?.('Message deleted', 'success');
    };

    const startEdit = (msg) => {
        setEditingMsg(msg.id);
        setEditText(msg.text);
        setContextMenu(null);
    };

    const saveEdit = (msgId) => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: editText, edited: true } : m));
        setEditingMsg(null);
        setEditText('');
        addToast?.('Message edited', 'success');
    };

    const archiveChat = (threadId) => {
        setArchived(a => ({ ...a, [threadId]: !a[threadId] }));
        addToast?.(archived[threadId] ? 'Chat unarchived' : 'Chat archived', 'success');
        if (!archived[threadId]) {
            setActiveThread(null);
            setShowChatSettings(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const newAttachments = files.map(f => ({
                name: f.name,
                size: (f.size / 1024).toFixed(1) + ' KB',
                type: f.type.startsWith('image/') ? 'image' : 'file',
            }));
            setAttachments(prev => [...prev, ...newAttachments]);
            addToast?.(`${files.length} file(s) attached`, 'success');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleFileSelect = () => {
        const fakeFile = { name: 'document.pdf', size: '245 KB', type: 'file' };
        setAttachments(prev => [...prev, fakeFile]);
        addToast?.('File attached', 'success');
    };

    const handleImageSelect = () => {
        const fakeImg = { name: 'photo.jpg', size: '1.2 MB', type: 'image', preview: 'https://api.dicebear.com/7.x/shapes/svg?seed=photo' };
        setAttachments(prev => [...prev, fakeImg]);
        addToast?.('Image attached', 'success');
    };

    const filteredThreads = threads.filter((t) => {
        if (filter === 'friends') return t.type === 'personal';
        if (filter === 'requests') return t.type === 'request';
        if (filter === 'archived') return archived[t.threadId];
        return !archived[t.threadId];
    }).filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

    const sortedThreads = [...filteredThreads].sort((a, b) => {
        if (pinned[a.threadId] && !pinned[b.threadId]) return -1;
        if (!pinned[a.threadId] && pinned[b.threadId]) return 1;
        return 0;
    });

    const activeBg = activeThread ? (chatBgs[activeThread.threadId] || 'transparent') : 'transparent';
    const friendProfile = activeThread ? users.find(u => activeThread.name.includes(u.name.split(' ')[0])) : null;

    return (
        <div className="chat-page">
            <div className="page-header">
                <h1 className="page-title">Chat</h1>
                <p className="page-subtitle">Stay connected with your network</p>
            </div>

            <div className="chat-layout-premium">
                {/* ═══ Chat Sidebar ═══ */}
                <div className={`chat-sidebar-premium ${mobileShowChat ? 'hidden-mobile' : ''}`}>
                    <div className="chat-sidebar-top">
                        <h3 className="chat-sidebar-title">Messages</h3>
                        <button className="btn-icon-sm" onClick={() => addToast?.('New chat coming soon!', 'info')} aria-label="New chat">
                            <Paperclip size={16} />
                        </button>
                    </div>

                    <div className="chat-search-bar">
                        <SearchInput placeholder="Search conversations…" onSearch={setSearch} />
                    </div>

                    <div className="chat-filters-premium">
                        {['all', 'friends', 'requests', 'archived'].map((f) => (
                            <button
                                key={f}
                                className={`chat-filter-pill ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'All' : f === 'friends' ? 'Friends' : f === 'requests' ? 'Requests' : 'Archived'}
                                {f === 'requests' && threads.filter(t => t.type === 'request').length > 0 && (
                                    <span className="filter-count">{threads.filter(t => t.type === 'request').length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="chat-thread-list">
                        {sortedThreads.map((thread) => (
                            <div
                                key={thread.threadId}
                                className={`chat-thread-card ${activeThread?.threadId === thread.threadId ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveThread(thread);
                                    setMobileShowChat(true);
                                    setShowProfile(false);
                                    setShowChatSettings(false);
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                <div className="thread-avatar-wrap">
                                    <Avatar src={thread.avatar} alt={thread.name} size="md" online={thread.online} />
                                    {pinned[thread.threadId] && <Pin size={10} className="thread-pin-icon" />}
                                </div>
                                <div className="thread-body">
                                    <div className="thread-top-row">
                                        <span className="thread-name">{thread.name}</span>
                                        <span className="thread-time">{formatThreadTime(thread.lastTime)}</span>
                                    </div>
                                    <div className="thread-bottom-row">
                                        <span className="thread-preview">
                                            {thread.type === 'request' ? '🤝 Friend request' : thread.lastMessage}
                                        </span>
                                        {thread.unread > 0 && (
                                            <span className="thread-unread">{thread.unread}</span>
                                        )}
                                        {muted[thread.threadId] && <BellOff size={11} className="thread-muted-icon" />}
                                    </div>
                                    {thread.type === 'request' && (
                                        <div className="thread-request-actions">
                                            <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); handleAcceptRequest(thread); }}>
                                                <UserPlus size={12} /> Accept
                                            </button>
                                            <button className="btn btn-sm btn-ghost" onClick={(e) => e.stopPropagation()}>
                                                <UserX size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══ Main Chat Area ═══ */}
                {activeThread ? (
                    <div
                        className={`chat-main-premium ${dragOver ? 'drag-active' : ''}`}
                        ref={chatMainRef}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {/* Drag & Drop Overlay */}
                        {dragOver && (
                            <div className="chat-drop-zone">
                                <Upload size={40} />
                                <span>Drop files here to send</span>
                            </div>
                        )}

                        {/* Header */}
                        <div className="chat-header-premium">
                            <button className="btn-icon-sm mobile-back" onClick={() => setMobileShowChat(false)}>
                                <ArrowLeft size={18} />
                            </button>
                            <div className="chat-header-profile" onClick={() => setShowProfile(!showProfile)}>
                                <Avatar src={activeThread.avatar} alt={activeThread.name} size="sm" online={activeThread.online} />
                                <div>
                                    <div className="chat-header-name">{activeThread.name}</div>
                                    <div className="chat-header-status">
                                        {typing ? 'typing…' : activeThread.online ? 'Online' : 'Last seen recently'}
                                    </div>
                                </div>
                            </div>
                            <div className="chat-header-actions">
                                <button className="btn-icon-sm" onClick={() => setShowSearch(!showSearch)} aria-label="Search in chat">
                                    <Search size={17} />
                                </button>
                                <button className="btn-icon-sm" onClick={() => addToast?.('Voice call starting...', 'info')} aria-label="Voice call">
                                    <Phone size={17} />
                                </button>
                                <button className="btn-icon-sm" onClick={() => addToast?.('Video call starting...', 'info')} aria-label="Video call">
                                    <Video size={17} />
                                </button>
                                <button
                                    className={`btn-icon-sm ${showChatSettings ? 'active-icon' : ''}`}
                                    onClick={() => setShowChatSettings(!showChatSettings)}
                                    aria-label="Chat settings"
                                >
                                    <Settings size={17} />
                                </button>
                            </div>
                        </div>

                        {/* Search in chat bar */}
                        {showSearch && (
                            <div className="chat-inline-search">
                                <Search size={14} />
                                <input
                                    type="text"
                                    placeholder="Search in this chat..."
                                    value={chatSearch}
                                    onChange={(e) => setChatSearch(e.target.value)}
                                    autoFocus
                                />
                                <button className="btn-icon-sm" onClick={() => { setShowSearch(false); setChatSearch(''); }}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {/* Chat Settings dropdown */}
                        {showChatSettings && (
                            <div ref={settingsRef} className="chat-settings-dropdown">
                                <div className="chat-settings-title">Chat Settings</div>
                                <div className="chat-settings-item" onClick={() => { setDisappearing(d => ({ ...d, [activeThread.threadId]: !d[activeThread.threadId] })); addToast?.(disappearing[activeThread.threadId] ? 'Disappearing messages off' : 'Messages will disappear in 24h', 'success'); }}>
                                    <Clock size={16} />
                                    <span>Disappearing Messages</span>
                                    <span className={`settings-toggle ${disappearing[activeThread.threadId] ? 'on' : ''}`}>
                                        {disappearing[activeThread.threadId] ? 'ON' : 'OFF'}
                                    </span>
                                </div>
                                <div className="chat-settings-item" onClick={() => toggleMute(activeThread.threadId)}>
                                    {muted[activeThread.threadId] ? <BellOff size={16} /> : <Bell size={16} />}
                                    <span>{muted[activeThread.threadId] ? 'Unmute Chat' : 'Mute Chat'}</span>
                                </div>
                                <div className="chat-settings-item" onClick={() => togglePin(activeThread.threadId)}>
                                    <Pin size={16} />
                                    <span>{pinned[activeThread.threadId] ? 'Unpin Chat' : 'Pin Chat'}</span>
                                </div>
                                <div className="chat-settings-item" onClick={() => archiveChat(activeThread.threadId)}>
                                    <Archive size={16} />
                                    <span>{archived[activeThread.threadId] ? 'Unarchive Chat' : 'Archive Chat'}</span>
                                </div>
                                <div className="chat-settings-divider" />
                                <div className="chat-settings-label">Chat Background</div>
                                <div className="chat-bg-grid">
                                    {chatBgPresets.map((bg) => (
                                        <button
                                            key={bg.name}
                                            className={`chat-bg-swatch ${chatBgs[activeThread.threadId] === bg.value ? 'selected' : ''}`}
                                            style={{ background: bg.value === 'transparent' ? '#f5f0ed' : bg.value }}
                                            onClick={() => setChatBgs(b => ({ ...b, [activeThread.threadId]: bg.value }))}
                                            title={bg.name}
                                        />
                                    ))}
                                </div>
                                <div className="chat-settings-divider" />
                                <div className="chat-settings-item danger" onClick={() => { addToast?.('Chat cleared', 'success'); setMessages([]); }}>
                                    <Trash2 size={16} />
                                    <span>Clear Chat</span>
                                </div>
                            </div>
                        )}

                        {/* Messages area */}
                        <div className="chat-messages-premium" style={{ background: activeBg }}>
                            <div className="chat-date-divider">
                                <span>Today</span>
                            </div>

                            <div className="chat-encryption-notice">
                                <Shield size={13} />
                                <span>Messages are secured with end-to-end encryption</span>
                            </div>

                            {messages
                                .filter(m => !chatSearch || m.text.toLowerCase().includes(chatSearch.toLowerCase()))
                                .map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`chat-msg ${msg.senderId === currentUser.id ? 'sent' : 'received'} ${msg.type === 'voice' ? 'voice-msg' : ''}`}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            setContextMenu({ id: msg.id, x: e.clientX, y: e.clientY, isMine: msg.senderId === currentUser.id });
                                        }}
                                    >
                                        {msg.senderId !== currentUser.id && (
                                            <Avatar src={activeThread.avatar} alt="" size="xs" />
                                        )}
                                        <div className="msg-content">
                                            {editingMsg === msg.id ? (
                                                <div className="msg-edit-wrap">
                                                    <input
                                                        className="msg-edit-input"
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(msg.id); if (e.key === 'Escape') setEditingMsg(null); }}
                                                        autoFocus
                                                    />
                                                    <button className="btn btn-sm btn-primary" onClick={() => saveEdit(msg.id)}>Save</button>
                                                    <button className="btn btn-sm btn-ghost" onClick={() => setEditingMsg(null)}>Cancel</button>
                                                </div>
                                            ) : (
                                                <div className={`msg-bubble ${starred[msg.id] ? 'starred' : ''}`}>
                                                    {msg.type === 'voice' ? (
                                                        <div className="voice-note-ui">
                                                            <Mic size={14} />
                                                            <div className="voice-wave">
                                                                {[...Array(12)].map((_, i) => (
                                                                    <div key={i} className="wave-bar" style={{ height: `${8 + Math.random() * 16}px` }} />
                                                                ))}
                                                            </div>
                                                            <span className="voice-dur">0:03</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {msg.attachments && msg.attachments.map((att, idx) => (
                                                                <div key={idx} className="msg-attachment">
                                                                    {att.type === 'image' ? (
                                                                        <div className="msg-image-preview">
                                                                            <img src={att.preview || `https://api.dicebear.com/7.x/shapes/svg?seed=${att.name}`} alt={att.name} />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="msg-file-preview">
                                                                            <FileText size={18} />
                                                                            <div>
                                                                                <span className="file-name">{att.name}</span>
                                                                                <span className="file-size">{att.size}</span>
                                                                            </div>
                                                                            <Download size={14} className="file-download" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <span>{msg.text}</span>
                                                            {msg.edited && <span className="msg-edited-tag">edited</span>}
                                                        </>
                                                    )}

                                                    {/* Inline reactions display */}
                                                    {reactions[msg.id] && Object.entries(reactions[msg.id]).filter(([, c]) => c > 0).length > 0 && (
                                                        <div className="msg-reactions">
                                                            {Object.entries(reactions[msg.id]).filter(([, c]) => c > 0).map(([emoji]) => (
                                                                <span key={emoji} className="msg-reaction" onClick={(e) => { e.stopPropagation(); addReaction(msg.id, emoji); }}>
                                                                    {emoji}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="msg-meta">
                                                <span className="msg-time">{formatChatTime(msg.time)}</span>
                                                {msg.senderId === currentUser.id && (
                                                    <span className="msg-status">
                                                        {msg.status === 'seen' ? <CheckCheck size={13} className="seen" /> : <Check size={13} />}
                                                    </span>
                                                )}
                                                <button className="msg-star-btn" onClick={() => toggleStar(msg.id)} aria-label="Star">
                                                    <Star size={11} fill={starred[msg.id] ? '#f59e0b' : 'none'} color={starred[msg.id] ? '#f59e0b' : '#aaa'} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {typing && (
                                <div className="chat-msg received">
                                    <Avatar src={activeThread.avatar} alt="" size="xs" />
                                    <div className="msg-content">
                                        <div className="msg-bubble typing-bubble">
                                            <div className="typing-dots">
                                                <span /><span /><span />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Context Menu */}
                        {contextMenu && (
                            <div className="msg-context-menu" style={{ top: contextMenu.y - 120, left: Math.min(contextMenu.x, window.innerWidth - 200) }} onClick={(e) => e.stopPropagation()}>
                                <div className="context-reactions">
                                    {reactionEmojis.map(emoji => (
                                        <button key={emoji} className="reaction-btn" onClick={() => addReaction(contextMenu.id, emoji)}>
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <div className="context-divider" />
                                <button className="context-item" onClick={() => { navigator.clipboard.writeText(messages.find(m => m.id === contextMenu.id)?.text || ''); addToast?.('Copied!', 'success'); setContextMenu(null); }}>
                                    <Copy size={14} /> Copy
                                </button>
                                <button className="context-item" onClick={() => { addToast?.('Message forwarded', 'success'); setContextMenu(null); }}>
                                    <Forward size={14} /> Forward
                                </button>
                                <button className="context-item" onClick={() => toggleStar(contextMenu.id)}>
                                    <Star size={14} /> {starred[contextMenu.id] ? 'Unstar' : 'Star'}
                                </button>
                                {contextMenu.isMine && (
                                    <>
                                        <button className="context-item" onClick={() => startEdit(messages.find(m => m.id === contextMenu.id))}>
                                            <Edit3 size={14} /> Edit
                                        </button>
                                        <button className="context-item danger" onClick={() => deleteMessage(contextMenu.id)}>
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Attachments Preview */}
                        {attachments.length > 0 && (
                            <div className="chat-attachments-bar">
                                {attachments.map((att, idx) => (
                                    <div key={idx} className="attachment-preview">
                                        {att.type === 'image' ? <Image size={14} /> : <FileText size={14} />}
                                        <span>{att.name}</span>
                                        <button className="btn-icon-sm" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Input bar */}
                        <div className="chat-input-premium">
                            <button className="btn-icon-sm" aria-label="Attach file" onClick={handleFileSelect}>
                                <Paperclip size={18} />
                            </button>
                            <button className="btn-icon-sm" aria-label="Send image" onClick={handleImageSelect}>
                                <Image size={18} />
                            </button>
                            <div className="chat-input-wrap">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Type a message…"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    aria-label="Message input"
                                />
                                <button className={`btn-icon-sm emoji-btn ${showEmoji ? 'active-icon' : ''}`} onClick={() => setShowEmoji(!showEmoji)} aria-label="Emoji">
                                    <Smile size={18} />
                                </button>
                            </div>
                            {input.trim() ? (
                                <button className="chat-send-btn" onClick={handleSend} aria-label="Send">
                                    <Send size={18} />
                                </button>
                            ) : (
                                <button
                                    className={`chat-send-btn ${isRecording ? 'recording' : ''}`}
                                    onClick={handleVoiceNote}
                                    aria-label={isRecording ? 'Stop recording' : 'Record voice note'}
                                >
                                    <Mic size={18} />
                                </button>
                            )}
                        </div>

                        {/* Emoji Picker */}
                        {showEmoji && (
                            <div className="emoji-picker-popup">
                                <div className="emoji-picker-header">
                                    <span>Emoji</span>
                                    <button className="btn-icon-sm" onClick={() => setShowEmoji(false)}><X size={14} /></button>
                                </div>
                                <div className="emoji-grid">
                                    {quickEmojis.map(emoji => (
                                        <button key={emoji} className="emoji-cell" onClick={() => { setInput(prev => prev + emoji); inputRef.current?.focus(); }}>
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="chat-empty-premium">
                        <EmptyStateIcon />
                        <h3>Start a conversation</h3>
                        <p>Select a chat from the sidebar or start a new one</p>
                    </div>
                )}

                {/* ═══ Profile Drawer ═══ */}
                {showProfile && activeThread && (
                    <div ref={profileRef} className="chat-profile-drawer">
                        <div className="profile-drawer-header">
                            <h4>Contact Info</h4>
                            <button className="btn-icon-sm" onClick={() => setShowProfile(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="profile-drawer-body">
                            <div className="profile-avatar-section">
                                <Avatar src={activeThread.avatar} alt={activeThread.name} size="xl" online={activeThread.online} />
                                <h3 className="profile-drawer-name">{activeThread.name}</h3>
                                <span className="profile-drawer-status">
                                    {activeThread.online ? '🟢 Online' : '⚪ Offline'}
                                </span>
                            </div>

                            {friendProfile && (
                                <>
                                    <div className="profile-info-section">
                                        <div className="profile-info-row">
                                            <BookOpen size={15} />
                                            <div>
                                                <div className="profile-info-label">Major</div>
                                                <div className="profile-info-value">{friendProfile.major}</div>
                                            </div>
                                        </div>
                                        <div className="profile-info-row">
                                            <Calendar size={15} />
                                            <div>
                                                <div className="profile-info-label">Year</div>
                                                <div className="profile-info-value">Year {friendProfile.year}</div>
                                            </div>
                                        </div>
                                        <div className="profile-info-row">
                                            <Info size={15} />
                                            <div>
                                                <div className="profile-info-label">Bio</div>
                                                <div className="profile-info-value">{friendProfile.bio}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="profile-actions-section">
                                        <button className="profile-action-btn" onClick={() => addToast?.('Message sent!', 'success')}>
                                            <Send size={15} /> Message
                                        </button>
                                        <button className="profile-action-btn" onClick={() => addToast?.('Voice call...', 'info')}>
                                            <Phone size={15} /> Call
                                        </button>
                                        <button className="profile-action-btn" onClick={() => addToast?.('Video call...', 'info')}>
                                            <Video size={15} /> Video
                                        </button>
                                    </div>

                                    <div className="profile-quick-links">
                                        <div className="profile-link-row" onClick={() => addToast?.('Invite sent!', 'success')}>
                                            <FolderKanban size={14} />
                                            <span>Invite to Project</span>
                                            <ChevronRight size={14} />
                                        </div>
                                        <div className="profile-link-row">
                                            <Star size={14} />
                                            <span>Starred Messages</span>
                                            <ChevronRight size={14} />
                                        </div>
                                        <div className="profile-link-row">
                                            <Image size={14} />
                                            <span>Media & Files</span>
                                            <ChevronRight size={14} />
                                        </div>
                                        <div className="profile-link-row" onClick={() => toggleMute(activeThread.threadId)}>
                                            {muted[activeThread.threadId] ? <BellOff size={14} /> : <Bell size={14} />}
                                            <span>{muted[activeThread.threadId] ? 'Unmute' : 'Mute Notifications'}</span>
                                            <ChevronRight size={14} />
                                        </div>
                                        <div className="profile-link-row danger" onClick={() => addToast?.('User blocked', 'success')}>
                                            <Ban size={14} />
                                            <span>Block User</span>
                                            <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyStateIcon() {
    return (
        <div className="chat-empty-icon">
            <MessageCircle size={40} />
        </div>
    );
}
