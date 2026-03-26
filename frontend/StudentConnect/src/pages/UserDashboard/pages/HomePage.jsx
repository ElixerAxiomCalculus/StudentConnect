import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Users, Clock, FolderKanban, MessageCircle, AtSign,
    Plus, UserPlus, Search, ArrowUpRight, TrendingUp,
    BarChart3, Heart, Eye, Zap, Award, BookOpen, Target,
    CalendarDays, Flame, ChevronRight, ThumbsUp, MessagesSquare
} from 'lucide-react';
import gsap from 'gsap';
import FrostCard from '../components/FrostCard';
import Avatar from '../components/Avatar';
import { getDashboardOverview, getLiveFeed } from '../data/api';
import { users } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

/* ── Analytics mock data ── */
const weeklyPostData = [28, 42, 35, 58, 47, 63, 52];
const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthlyFollowers = [120, 135, 128, 142, 155, 168, 180, 195, 210, 225, 240, 262];
const monthLabels = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const engagementBreakdown = [
    { label: 'Posts', value: 42, color: '#d44332', icon: BarChart3 },
    { label: 'Comments', value: 128, color: '#3b5999', icon: MessageCircle },
    { label: 'Reactions', value: 315, color: '#00aced', icon: Heart },
    { label: 'Views', value: 2847, color: '#f59e0b', icon: Eye },
];
const streakData = { current: 14, best: 23, total: 187 };
const topSkills = [
    { name: 'React', level: 92 },
    { name: 'Python', level: 85 },
    { name: 'Machine Learning', level: 73 },
    { name: 'UI/UX Design', level: 68 },
    { name: 'Node.js', level: 80 },
];
const upcomingEvents = [
    { id: 'e1', title: 'ML Study Group', time: 'Today, 6:00 PM', type: 'study' },
    { id: 'e2', title: 'Physics Report Due', time: 'Feb 28, 11:59 PM', type: 'deadline' },
    { id: 'e3', title: 'Hackathon Kickoff', time: 'Mar 2, 10:00 AM', type: 'event' },
    { id: 'e4', title: 'DSA Practice', time: 'Mar 1, 2:00 PM', type: 'study' },
];

const statConfig = [
    { key: 'activeMatches', label: 'Active Matches', iconClass: 'icon-matches', icon: Users },
    { key: 'pendingRequests', label: 'Pending Requests', iconClass: 'icon-requests', icon: Clock },
    { key: 'activeProjects', label: 'Active Projects', iconClass: 'icon-projects', icon: FolderKanban },
    { key: 'upcomingDeadlines', label: 'Upcoming Deadlines', iconClass: 'icon-deadlines', icon: Clock },
    { key: 'forumMentions', label: 'Forum Mentions', iconClass: 'icon-mentions', icon: AtSign },
];

function formatTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000 / 60 / 60;
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    if (diff < 48) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/* ── SVG Mini Bar Chart ── */
function MiniBarChart({ data, labels, color = '#d44332', height = 140 }) {
    const barsRef = useRef([]);
    const max = Math.max(...data);

    useEffect(() => {
        barsRef.current.forEach((bar, i) => {
            if (bar) {
                gsap.fromTo(bar,
                    { scaleY: 0, transformOrigin: 'bottom' },
                    { scaleY: 1, duration: 0.6, delay: i * 0.08, ease: 'back.out(1.4)' }
                );
            }
        });
    }, [data]);

    return (
        <div className="mini-chart-container">
            <svg width="100%" height={height} viewBox={`0 0 ${data.length * 40} ${height}`} preserveAspectRatio="xMidYMid meet">
                {data.map((val, i) => {
                    const barH = (val / max) * (height - 30);
                    return (
                        <g key={i}>
                            <rect
                                ref={el => barsRef.current[i] = el}
                                x={i * 40 + 8}
                                y={height - barH - 20}
                                width={24}
                                height={barH}
                                rx={6}
                                fill={`${color}${i === data.length - 1 ? '' : '88'}`}
                            />
                            <text
                                x={i * 40 + 20}
                                y={height - 4}
                                textAnchor="middle"
                                fill="#8888a0"
                                fontSize="10"
                                fontFamily="Inter"
                            >
                                {labels[i]}
                            </text>
                            <text
                                x={i * 40 + 20}
                                y={height - barH - 26}
                                textAnchor="middle"
                                fill="#555566"
                                fontSize="9"
                                fontWeight="600"
                                fontFamily="Inter"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

/* ── Circular progress ring ── */
function ProgressRing({ value, max, size = 64, color = '#d44332', label }) {
    const ringRef = useRef(null);
    const r = (size - 8) / 2;
    const circumference = 2 * Math.PI * r;
    const pct = value / max;

    useEffect(() => {
        if (ringRef.current) {
            gsap.fromTo(ringRef.current,
                { strokeDashoffset: circumference },
                { strokeDashoffset: circumference * (1 - pct), duration: 1.2, ease: 'power3.out' }
            );
        }
    }, [value]);

    return (
        <div className="progress-ring-wrap">
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="5" />
                <circle
                    ref={ringRef}
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <div className="progress-ring-label">
                <span className="progress-ring-value">{value}</span>
                <span className="progress-ring-text">{label}</span>
            </div>
        </div>
    );
}

/* ── Animated Skill Bar ── */
function SkillBar({ name, level }) {
    const fillRef = useRef(null);

    useEffect(() => {
        if (fillRef.current) {
            gsap.fromTo(fillRef.current,
                { width: '0%' },
                { width: `${level}%`, duration: 1, delay: 0.3, ease: 'power3.out' }
            );
        }
    }, [level]);

    return (
        <div className="skill-bar-row">
            <div className="skill-bar-label">
                <span>{name}</span>
                <span className="skill-pct">{level}%</span>
            </div>
            <div className="skill-bar-track">
                <div ref={fillRef} className="skill-bar-fill" style={{
                    background: level > 85 ? '#d44332' : level > 70 ? '#3b5999' : '#00aced',
                }} />
            </div>
        </div>
    );
}

export default function HomePage() {
    const [data, setData] = useState(null);
    const [feed, setFeed] = useState([]);
    const navigate = useNavigate();
    const pageRef = useRef(null);
    const sectionsRef = useRef([]);

    useEffect(() => {
        getDashboardOverview().then(setData);
        getLiveFeed().then(setFeed);
    }, []);

    // GSAP stagger entrance for all sections
    useEffect(() => {
        if (!data || !pageRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(sectionsRef.current.filter(Boolean),
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
            );
        }, pageRef);
        return () => ctx.revert();
    }, [data]);

    const addSection = useCallback((el) => {
        if (el && !sectionsRef.current.includes(el)) {
            sectionsRef.current.push(el);
        }
    }, []);

    if (!data) {
        return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading…</div>;
    }

    return (
        <div ref={pageRef} className="home-page">
            {/* Header */}
            <div ref={addSection} className="page-header">
                <h1 className="page-title">Welcome back, Sayak 👋</h1>
                <p className="page-subtitle">Here's what's happening with your network</p>
            </div>

            {/* ═══ Two-Column Layout: Live Feed + Analytics ═══ */}
            <div className="home-two-col">

                {/* ──────── LEFT: Live Feed ──────── */}
                <div ref={addSection} className="live-feed-panel">
                    <h2 className="feed-panel-title">
                        <Zap size={18} /> Live Feed
                        <span className="section-badge">{feed.length} updates</span>
                    </h2>

                    <div className="feed-list">
                        {feed.map((item) => (
                            <div key={item.id} className="feed-item" onClick={() => navigate(item.type === 'project' ? '/dashboard/projects' : '/dashboard/forums')}>
                                <div className="feed-item-header">
                                    <Avatar src={item.author.avatar} alt={item.author.name} size="sm" />
                                    <div className="feed-item-meta">
                                        <span className="feed-author">{item.author.name}</span>
                                        <span className="feed-time">{formatTime(item.time)}</span>
                                    </div>
                                    <span className={`feed-type-badge ${item.type}`}>
                                        {item.type === 'project' ? <FolderKanban size={12} /> : <MessagesSquare size={12} />}
                                        {item.type === 'project' ? 'Project' : 'Discussion'}
                                    </span>
                                </div>

                                <h3 className="feed-item-title">{item.title}</h3>
                                <p className="feed-item-desc">{item.description}</p>

                                <div className="feed-item-tags">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="feed-tag">{tag}</span>
                                    ))}
                                </div>

                                <div className="feed-item-stats">
                                    {item.type === 'project' ? (
                                        <>
                                            <span><Users size={13} /> {item.stats.members} members</span>
                                            <span><FolderKanban size={13} /> {item.stats.tasks} tasks</span>
                                            <span><TrendingUp size={13} /> {item.stats.progress}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <span><ThumbsUp size={13} /> {item.stats.upvotes} upvotes</span>
                                            <span><MessageCircle size={13} /> {item.stats.replies} replies</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ──────── RIGHT: Analytics & Overview ──────── */}
                <div ref={addSection} className="analytics-panel">
                    {/* Quick Actions */}
                    <div className="quick-actions-compact">
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/projects')}>
                            <Plus size={14} /> Create Project
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard/groups')}>
                            <Users size={14} /> Start Group
                        </button>
                        <button className="btn btn-secondary btn-sm">
                            <Search size={14} /> Find Match
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="stats-grid-compact">
                        {statConfig.map(({ key, label, iconClass, icon: Icon }) => (
                            <div key={key} className="stat-card-compact">
                                <div className={`stat-icon-sm ${iconClass}`}>
                                    <Icon size={16} />
                                </div>
                                <div className="stat-info-compact">
                                    <span className="stat-value-compact">{data[key]}</span>
                                    <span className="stat-label-compact">{label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Post Analytics Chart */}
                    <FrostCard flat>
                        <h3 className="section-title">
                            <BarChart3 size={16} /> Post Analytics <span className="section-badge">This Week</span>
                        </h3>
                        <MiniBarChart data={weeklyPostData} labels={weekLabels} color="#d44332" height={120} />
                        <div className="chart-summary">
                            <div><span className="chart-big">325</span> total</div>
                            <div className="chart-trend up"><TrendingUp size={13} /> +18%</div>
                        </div>
                    </FrostCard>

                    {/* Engagement Breakdown */}
                    <FrostCard flat>
                        <h3 className="section-title">
                            <Zap size={16} /> Engagement
                        </h3>
                        <div className="engagement-grid">
                            {engagementBreakdown.map(({ label, value, color, icon: Icon }) => (
                                <div key={label} className="engagement-item">
                                    <div className="engagement-icon" style={{ background: `${color}15`, color }}>
                                        <Icon size={16} />
                                    </div>
                                    <div>
                                        <div className="engagement-value">{value.toLocaleString()}</div>
                                        <div className="engagement-label">{label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </FrostCard>

                    {/* Streak + Skills Row */}
                    <FrostCard flat>
                        <h3 className="section-title"><Flame size={16} /> Activity Streak</h3>
                        <div className="streak-content">
                            <ProgressRing value={streakData.current} max={streakData.best} size={64} color="#d44332" label="day streak" />
                            <div className="streak-stats">
                                <div><span className="streak-num">{streakData.best}</span> best</div>
                                <div><span className="streak-num">{streakData.total}</span> total days</div>
                            </div>
                        </div>
                    </FrostCard>

                    <FrostCard flat>
                        <h3 className="section-title"><Award size={16} /> Top Skills</h3>
                        <div className="skills-list">
                            {topSkills.map(({ name, level }) => (
                                <SkillBar key={name} name={name} level={level} />
                            ))}
                        </div>
                    </FrostCard>

                    {/* Upcoming Events */}
                    <FrostCard flat>
                        <h3 className="section-title"><CalendarDays size={16} /> Upcoming</h3>
                        <div className="events-list">
                            {upcomingEvents.map((evt) => (
                                <div key={evt.id} className="event-item">
                                    <div className={`event-dot ${evt.type}`} />
                                    <div>
                                        <div className="event-title">{evt.title}</div>
                                        <div className="event-time">{evt.time}</div>
                                    </div>
                                    <ChevronRight size={14} className="event-arrow" />
                                </div>
                            ))}
                        </div>
                    </FrostCard>

                    {/* Recent Collaborators */}
                    <FrostCard flat>
                        <h3 className="section-title">
                            <UserPlus size={16} /> Collaborators
                        </h3>
                        <div className="collaborators-row" style={{ flexDirection: 'column' }}>
                            {users.slice(0, 3).map((user) => (
                                <div key={user.id} className="collaborator-chip">
                                    <Avatar src={user.avatar} alt={user.name} size="xs" online={user.online} />
                                    <div>
                                        <div className="collaborator-name">{user.name}</div>
                                        <div className="collaborator-major">{user.major}</div>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-ghost"
                                        style={{ marginLeft: 'auto', fontSize: '0.68rem' }}
                                        onClick={(e) => { e.stopPropagation(); navigate('/dashboard/chat'); }}
                                    >
                                        <MessageCircle size={11} /> Msg
                                    </button>
                                </div>
                            ))}
                        </div>
                    </FrostCard>
                </div>
            </div>
        </div>
    );
}
