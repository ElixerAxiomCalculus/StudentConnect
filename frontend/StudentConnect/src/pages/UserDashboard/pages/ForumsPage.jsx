import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronUp, ChevronDown, MessageCircle, Bookmark, Flag,
    ChevronLeft, Pin, Clock, User, Search, Plus, X,
    Share2, Edit3, Trash2, MoreHorizontal, Eye, Heart,
    TrendingUp, Sparkles, Filter, Tag, Copy, Send,
    ArrowUpRight, MessageSquare, AtSign, ChevronRight,
    AlertTriangle, ThumbsUp, CornerDownRight, Minus
} from 'lucide-react';
import FrostCard from '../components/FrostCard';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { getForumThreads, getForumCategories, voteThread } from '../data/api';
import { users, currentUser } from '../data/mockData';

function formatTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000 / 60;
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    const hours = diff / 60;
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    if (hours < 48) return 'Yesterday';
    const days = hours / 24;
    if (days < 7) return `${Math.floor(days)}d ago`;
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

const categoryIcons = {
    'General Discussion': '💬',
    'Study Groups': '📚',
    'Project Showcase': '🏆',
    'Help & Support': '🆘',
};

export default function ForumsPage() {
    const [threads, setThreads] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCat, setActiveCat] = useState('all');
    const [sort, setSort] = useState('new');
    const [selectedThread, setSelectedThread] = useState(null);
    const [votedThreads, setVotedThreads] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [bookmarked, setBookmarked] = useState({});
    const [createForm, setCreateForm] = useState({ title: '', content: '', tags: '', categoryId: '' });
    const addToast = useToast();

    useEffect(() => {
        getForumThreads().then(setThreads);
        getForumCategories().then(setCategories);
    }, []);

    const handleVote = async (threadId, direction, e) => {
        e.stopPropagation();
        if (votedThreads[threadId]) return;
        await voteThread(threadId, direction);
        setThreads(prev =>
            prev.map(t =>
                t.id === threadId
                    ? { ...t, upvotes: t.upvotes + (direction === 'up' ? 1 : 0), downvotes: t.downvotes + (direction === 'down' ? 1 : 0) }
                    : t
            )
        );
        setVotedThreads(prev => ({ ...prev, [threadId]: direction }));
    };

    const toggleBookmark = (threadId, e) => {
        e.stopPropagation();
        setBookmarked(prev => ({ ...prev, [threadId]: !prev[threadId] }));
        addToast?.(bookmarked[threadId] ? 'Removed from bookmarks' : 'Bookmarked!', 'success');
    };

    const handleShare = (thread, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`studentconnect.app/forums/${thread.id}`);
        addToast?.('Link copied!', 'success');
    };

    const handleCreate = () => {
        if (!createForm.title.trim()) return;
        const newThread = {
            id: 'f' + Date.now(),
            categoryId: createForm.categoryId || 'cat1',
            title: createForm.title,
            author: { name: currentUser.name, avatar: currentUser.avatar },
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0,
            replies: 0,
            bookmarked: false,
            pinned: false,
            comments: [{ id: 'c' + Date.now(), author: { name: currentUser.name, avatar: currentUser.avatar }, text: createForm.content, time: new Date().toISOString(), upvotes: 0, downvotes: 0, replies: [] }],
        };
        setThreads(prev => [newThread, ...prev]);
        setShowCreate(false);
        setCreateForm({ title: '', content: '', tags: '', categoryId: '' });
        addToast?.('Thread created!', 'success');
    };

    let filtered = activeCat === 'all' ? threads : threads.filter(t => t.categoryId === activeCat);

    // Search filter
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.author.name.toLowerCase().includes(q));
    }

    // Sort
    if (sort === 'top') filtered = [...filtered].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    else if (sort === 'active') filtered = [...filtered].sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    else filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (selectedThread) {
        return <ThreadDetail thread={selectedThread} onBack={() => setSelectedThread(null)} addToast={addToast} />;
    }

    return (
        <div className="forums-page">
            <div className="page-header">
                <div className="forums-header-row">
                    <div>
                        <h1 className="page-title">Forums</h1>
                        <p className="page-subtitle">Discuss, share, and learn from the community</p>
                    </div>
                    <div className="forums-header-actions">
                        <button className="btn btn-secondary forums-search-btn" onClick={() => setShowSearch(!showSearch)}>
                            <Search size={15} />
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                            <Plus size={16} /> New Thread
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
                <div className="forums-search-bar">
                    <Search size={15} />
                    <input
                        autoFocus
                        placeholder="Search threads by title or author..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && <button className="forums-search-clear" onClick={() => setSearchQuery('')}><X size={14} /></button>}
                </div>
            )}

            {/* Categories */}
            <div className="forums-categories">
                <button className={`forums-cat-chip ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat('all')}>
                    🌐 All <span className="forums-cat-count">{threads.length}</span>
                </button>
                {categories.map(cat => (
                    <button key={cat.id} className={`forums-cat-chip ${activeCat === cat.id ? 'active' : ''}`} onClick={() => setActiveCat(cat.id)}>
                        {categoryIcons[cat.name] || '📂'} {cat.name} <span className="forums-cat-count">{cat.count}</span>
                    </button>
                ))}
            </div>

            {/* Sort Toolbar */}
            <div className="forums-sort-bar">
                <div className="forums-sort-tabs">
                    {[
                        { key: 'new', icon: <Sparkles size={13} />, label: 'Latest' },
                        { key: 'top', icon: <TrendingUp size={13} />, label: 'Most Popular' },
                        { key: 'active', icon: <MessageCircle size={13} />, label: 'Most Active' },
                    ].map(s => (
                        <button key={s.key} className={`forums-sort-btn ${sort === s.key ? 'active' : ''}`} onClick={() => setSort(s.key)}>
                            {s.icon} {s.label}
                        </button>
                    ))}
                </div>
                <span className="forums-result-count">{filtered.length} thread{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Thread Feed */}
            <div className="forums-feed">
                {filtered.map(thread => {
                    const net = thread.upvotes - thread.downvotes;
                    const isBookmarked = bookmarked[thread.id] || thread.bookmarked;
                    const firstComment = thread.comments?.[0]?.text || '';
                    const preview = firstComment.length > 140 ? firstComment.slice(0, 140) + '...' : firstComment;
                    const catObj = categories.find(c => c.id === thread.categoryId);

                    return (
                        <div key={thread.id} className={`forums-thread-card ${thread.pinned ? 'pinned' : ''}`} onClick={() => setSelectedThread(thread)}>
                            {/* Vote Column */}
                            <div className="forums-vote-col">
                                <button className={`forums-vote-btn up ${votedThreads[thread.id] === 'up' ? 'voted' : ''}`} onClick={e => handleVote(thread.id, 'up', e)}>
                                    <ChevronUp size={18} />
                                </button>
                                <span className={`forums-vote-count ${net > 0 ? 'positive' : net < 0 ? 'negative' : ''}`}>{net}</span>
                                <button className={`forums-vote-btn down ${votedThreads[thread.id] === 'down' ? 'voted' : ''}`} onClick={e => handleVote(thread.id, 'down', e)}>
                                    <ChevronDown size={18} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="forums-thread-content">
                                <div className="forums-thread-top">
                                    {thread.pinned && <span className="forums-pinned-tag"><Pin size={10} /> Pinned</span>}
                                    {catObj && <span className="forums-category-tag">{categoryIcons[catObj.name] || '📂'} {catObj.name}</span>}
                                </div>
                                <h3 className="forums-thread-title">{thread.title}</h3>
                                {preview && <p className="forums-thread-preview">{preview}</p>}
                                <div className="forums-thread-footer">
                                    <div className="forums-thread-author">
                                        <Avatar src={thread.author.avatar} alt={thread.author.name} size="xs" />
                                        <span>{thread.author.name}</span>
                                        <span className="forums-thread-time">{formatTime(thread.createdAt)}</span>
                                    </div>
                                    <div className="forums-thread-actions">
                                        <span className="forums-action-chip"><MessageCircle size={13} /> {thread.replies}</span>
                                        <button className={`forums-action-chip ${isBookmarked ? 'active' : ''}`} onClick={e => toggleBookmark(thread.id, e)}>
                                            <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
                                        </button>
                                        <button className="forums-action-chip" onClick={e => handleShare(thread, e)}>
                                            <Share2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="forums-empty">
                        <MessageSquare size={40} />
                        <h3>No threads found</h3>
                        <p>Start a discussion or adjust your filters</p>
                    </div>
                )}
            </div>

            {/* Create Thread Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Start a New Discussion"
                footer={<><button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={!createForm.title.trim()}>Post Thread</button></>}>
                <div className="settings-field">
                    <label className="settings-label">Title *</label>
                    <input className="input" placeholder="What's on your mind?" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} />
                </div>
                <div className="settings-field">
                    <label className="settings-label">Content</label>
                    <textarea className="settings-textarea" rows={5} placeholder="Share your thoughts, question, or idea..." value={createForm.content} onChange={e => setCreateForm({ ...createForm, content: e.target.value })} style={{ minHeight: 120 }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="settings-field" style={{ flex: 1 }}>
                        <label className="settings-label">Category</label>
                        <select className="input" value={createForm.categoryId} onChange={e => setCreateForm({ ...createForm, categoryId: e.target.value })}>
                            <option value="">Select category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="settings-field" style={{ flex: 1 }}>
                        <label className="settings-label">Tags (comma-separated)</label>
                        <input className="input" placeholder="AI, React, Exams" value={createForm.tags} onChange={e => setCreateForm({ ...createForm, tags: e.target.value })} />
                    </div>
                </div>
                {createForm.title && (
                    <div className="forums-preview-box">
                        <span className="forums-preview-label">Preview</span>
                        <h4>{createForm.title}</h4>
                        <p>{createForm.content || 'Your content will appear here...'}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}

/* ═══ Thread Detail View ═══ */
function ThreadDetail({ thread, onBack, addToast }) {
    const [commentVotes, setCommentVotes] = useState({});
    const [collapsed, setCollapsed] = useState({});
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [threadBookmarked, setThreadBookmarked] = useState(thread.bookmarked || false);
    const [following, setFollowing] = useState(false);
    const [reported, setReported] = useState({});
    const [liked, setLiked] = useState({});
    const inputRef = useRef(null);

    const handleCommentVote = (commentId, dir) => {
        if (commentVotes[commentId]) return;
        setCommentVotes(prev => ({ ...prev, [commentId]: dir }));
    };

    const toggleCollapse = (commentId) => {
        setCollapsed(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const postComment = () => {
        if (!newComment.trim()) return;
        addToast?.('Comment posted!', 'success');
        setNewComment('');
    };

    const postReply = (parentId) => {
        if (!replyText.trim()) return;
        addToast?.('Reply posted!', 'success');
        setReplyTo(null);
        setReplyText('');
    };

    const handleReport = (id) => {
        setReported(prev => ({ ...prev, [id]: true }));
        addToast?.('Reported. Thank you.', 'info');
    };

    const toggleLike = (id) => {
        setLiked(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const shareThread = () => {
        navigator.clipboard.writeText(`studentconnect.app/forums/${thread.id}`);
        addToast?.('Link copied!', 'success');
    };

    return (
        <div className="forums-detail">
            <button className="proj-back-btn" onClick={onBack}>
                <ChevronLeft size={16} /> Back to Forums
            </button>

            {/* Thread Header */}
            <div className="forums-detail-header">
                <div className="forums-detail-meta-row">
                    {thread.pinned && <span className="forums-pinned-tag"><Pin size={10} /> Pinned</span>}
                    <span className="forums-detail-time"><Clock size={12} /> {formatTime(thread.createdAt)}</span>
                </div>
                <h1 className="forums-detail-title">{thread.title}</h1>
                <div className="forums-detail-author">
                    <Avatar src={thread.author.avatar} alt={thread.author.name} size="sm" />
                    <div>
                        <span className="forums-detail-author-name">{thread.author.name}</span>
                        <span className="forums-detail-author-meta">{thread.replies} replies · {thread.upvotes} upvotes</span>
                    </div>
                </div>
                <div className="forums-detail-actions">
                    <button className={`forums-detail-action-btn ${threadBookmarked ? 'active' : ''}`} onClick={() => { setThreadBookmarked(!threadBookmarked); addToast?.(threadBookmarked ? 'Removed bookmark' : 'Bookmarked!', 'success'); }}>
                        <Bookmark size={14} fill={threadBookmarked ? 'currentColor' : 'none'} /> {threadBookmarked ? 'Saved' : 'Save'}
                    </button>
                    <button className={`forums-detail-action-btn ${following ? 'active' : ''}`} onClick={() => { setFollowing(!following); addToast?.(following ? 'Unfollowed' : 'Following thread', 'success'); }}>
                        <Eye size={14} /> {following ? 'Following' : 'Follow'}
                    </button>
                    <button className="forums-detail-action-btn" onClick={shareThread}>
                        <Share2 size={14} /> Share
                    </button>
                    <button className="forums-detail-action-btn danger" onClick={() => handleReport(thread.id)}>
                        <Flag size={14} /> Report
                    </button>
                </div>
            </div>

            {/* Comments */}
            <div className="forums-comments-section">
                <div className="forums-comments-header">
                    <h3><MessageCircle size={16} /> {thread.comments?.length || 0} Comments</h3>
                </div>

                {/* Comment Composer */}
                <div className="forums-comment-composer">
                    <Avatar src={currentUser.avatar} alt="You" size="sm" />
                    <div className="forums-composer-input-wrap">
                        <textarea
                            ref={inputRef}
                            className="forums-composer-textarea"
                            placeholder="Share your thoughts..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            rows={2}
                        />
                        <div className="forums-composer-footer">
                            <span className="forums-composer-hint">Supports @mentions</span>
                            <button className="btn btn-sm btn-primary" onClick={postComment} disabled={!newComment.trim()}>
                                <Send size={13} /> Post
                            </button>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                {thread.comments?.map(comment => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        depth={0}
                        commentVotes={commentVotes}
                        onVote={handleCommentVote}
                        collapsed={collapsed}
                        onToggleCollapse={toggleCollapse}
                        replyTo={replyTo}
                        setReplyTo={setReplyTo}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        onPostReply={postReply}
                        reported={reported}
                        onReport={handleReport}
                        liked={liked}
                        onToggleLike={toggleLike}
                    />
                ))}
            </div>
        </div>
    );
}

/* ═══ Recursive Comment Component ═══ */
function CommentItem({ comment, depth, commentVotes, onVote, collapsed, onToggleCollapse, replyTo, setReplyTo, replyText, setReplyText, onPostReply, reported, onReport, liked, onToggleLike }) {
    const isCollapsed = collapsed[comment.id];
    const isReplying = replyTo === comment.id;
    const isLiked = liked[comment.id];
    const upCount = comment.upvotes + (commentVotes[comment.id] === 'up' ? 1 : 0);
    const isTopComment = depth === 0 && upCount >= 10;

    return (
        <div className={`forums-comment ${depth > 0 ? 'nested' : ''} ${isTopComment ? 'top-comment' : ''}`} style={{ marginLeft: depth > 0 ? Math.min(depth * 24, 72) : 0 }}>
            {depth > 0 && <div className="forums-comment-thread-line" />}
            <div className="forums-comment-main">
                <div className="forums-comment-head">
                    <Avatar src={comment.author.avatar} alt={comment.author.name} size={depth > 0 ? 'xs' : 'sm'} />
                    <span className="forums-comment-author-name">{comment.author.name}</span>
                    {isTopComment && <span className="forums-top-badge">🔥 Top</span>}
                    <span className="forums-comment-ago">{formatTime(comment.time)}</span>
                    {comment.replies?.length > 0 && (
                        <button className="forums-collapse-btn" onClick={() => onToggleCollapse(comment.id)}>
                            {isCollapsed ? <Plus size={12} /> : <Minus size={12} />}
                            {isCollapsed ? `Show ${comment.replies.length}` : 'Collapse'}
                        </button>
                    )}
                </div>

                {reported[comment.id] ? (
                    <div className="forums-reported-notice"><AlertTriangle size={13} /> This content has been reported</div>
                ) : (
                    <div className="forums-comment-body">{comment.text}</div>
                )}

                <div className="forums-comment-bar">
                    <button className={`forums-cmt-action ${commentVotes[comment.id] === 'up' ? 'voted' : ''}`} onClick={() => onVote(comment.id, 'up')}>
                        <ChevronUp size={14} /> {upCount}
                    </button>
                    <button className={`forums-cmt-action ${commentVotes[comment.id] === 'down' ? 'voted-down' : ''}`} onClick={() => onVote(comment.id, 'down')}>
                        <ChevronDown size={14} />
                    </button>
                    <button className={`forums-cmt-action ${isLiked ? 'liked' : ''}`} onClick={() => onToggleLike(comment.id)}>
                        <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} /> {isLiked ? 'Liked' : 'Like'}
                    </button>
                    <button className="forums-cmt-action" onClick={() => setReplyTo(isReplying ? null : comment.id)}>
                        <CornerDownRight size={13} /> Reply
                    </button>
                    <button className="forums-cmt-action danger" onClick={() => onReport(comment.id)}>
                        <Flag size={12} />
                    </button>
                </div>

                {/* Reply Input */}
                {isReplying && (
                    <div className="forums-reply-composer">
                        <textarea
                            autoFocus
                            className="forums-reply-input"
                            placeholder={`Reply to ${comment.author.name}...`}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            rows={2}
                        />
                        <div className="forums-reply-actions">
                            <button className="btn btn-sm btn-ghost" onClick={() => setReplyTo(null)}>Cancel</button>
                            <button className="btn btn-sm btn-primary" onClick={() => onPostReply(comment.id)} disabled={!replyText.trim()}>
                                <Send size={12} /> Reply
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Nested Replies */}
            {!isCollapsed && comment.replies?.map(reply => (
                <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    commentVotes={commentVotes}
                    onVote={onVote}
                    collapsed={collapsed}
                    onToggleCollapse={onToggleCollapse}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    onPostReply={onPostReply}
                    reported={reported}
                    onReport={onReport}
                    liked={liked}
                    onToggleLike={onToggleLike}
                />
            ))}
        </div>
    );
}
