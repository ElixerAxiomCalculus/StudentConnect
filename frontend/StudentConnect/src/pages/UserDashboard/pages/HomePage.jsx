import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Users, Clock, FolderKanban, MessageCircle, AtSign,
    Plus, UserPlus, Search, TrendingUp,
    BarChart3, Heart, Eye, Zap, Award, Target,
    CalendarDays, Flame, ChevronRight, ThumbsUp, MessagesSquare
} from 'lucide-react';
import gsap from 'gsap';
import FrostCard from '../components/FrostCard';
import Avatar from '../components/Avatar';
import { getDashboardOverview, getLiveFeed, getDashboardAnalytics } from '../data/api';
import { useNavigate } from 'react-router-dom';

/* ── Static analytics (enhanced with API supplemental data) ── */
const weeklyPostData = [28, 42, 35, 58, 47, 63, 52];
const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthlyFollowers = [120, 135, 128, 142, 155, 168, 180, 195, 210, 225, 240, 262];
const monthLabels = ['M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J', 'F'];

const engagementBreakdown = [
    { label: 'Posts',     value: 42,   color: '#d44332', icon: BarChart3 },
    { label: 'Comments',  value: 128,  color: '#3b5999', icon: MessageCircle },
    { label: 'Reactions', value: 315,  color: '#0080b2', icon: Heart },
    { label: 'Views',     value: 2847, color: '#f59e0b', icon: Eye },
];
const streakData = { current: 14, best: 23, total: 187 };
const topSkills = [
    { name: 'React',           level: 92 },
    { name: 'Python',          level: 85 },
    { name: 'Machine Learning',level: 73 },
    { name: 'UI/UX Design',    level: 68 },
    { name: 'Node.js',         level: 80 },
];
const upcomingEvents = [
    { id: 'e1', title: 'ML Study Group',      time: 'Today, 6:00 PM',     type: 'study' },
    { id: 'e2', title: 'Physics Report Due',  time: 'Feb 28, 11:59 PM',  type: 'deadline' },
    { id: 'e3', title: 'Hackathon Kickoff',   time: 'Mar 2, 10:00 AM',   type: 'event' },
    { id: 'e4', title: 'DSA Practice',        time: 'Mar 1, 2:00 PM',    type: 'study' },
];
const statConfig = [
    { key: 'activeMatches',    label: 'Active Matches',    iconClass: 'icon-matches',   icon: Users },
    { key: 'pendingRequests',  label: 'Pending Requests',  iconClass: 'icon-requests',  icon: Clock },
    { key: 'activeProjects',   label: 'Active Projects',   iconClass: 'icon-projects',  icon: FolderKanban },
    { key: 'upcomingDeadlines',label: 'Upcoming Deadlines',iconClass: 'icon-deadlines', icon: Target },
    { key: 'forumMentions',    label: 'Forum Mentions',    iconClass: 'icon-mentions',  icon: AtSign },
];

function formatTime(iso) {
    const d = new Date(iso);
    const diff = (Date.now() - d) / 1000 / 60 / 60;
    if (diff < 1)  return 'Just now';
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    if (diff < 48) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/* ── CSS Flex Bar Chart (fully responsive, no SVG width issues) ── */
function BarChart({ data, labels, color = '#d44332', height = 120 }) {
    const barsRef = useRef([]);
    const max = Math.max(...data);

    useEffect(() => {
        barsRef.current.forEach((el, i) => {
            if (!el) return;
            gsap.fromTo(el,
                { scaleY: 0, transformOrigin: 'bottom' },
                { scaleY: 1, duration: 0.55, delay: i * 0.07, ease: 'back.out(1.3)' }
            );
        });
    }, [data]);

    return (
        <div className="bar-chart-wrap" style={{ height }}>
            {data.map((val, i) => {
                const pct = (val / max) * 100;
                const isLast = i === data.length - 1;
                return (
                    <div key={i} className="bar-chart-col">
                        <span className="bar-val">{val}</span>
                        <div className="bar-outer">
                            <div
                                ref={el => barsRef.current[i] = el}
                                className="bar-inner"
                                style={{
                                    height: `${pct}%`,
                                    background: isLast
                                        ? `linear-gradient(180deg, ${color}, ${color}bb)`
                                        : `${color}55`,
                                    boxShadow: isLast ? `0 0 12px ${color}44` : 'none',
                                }}
                            />
                        </div>
                        <span className="bar-label">{labels[i]}</span>
                    </div>
                );
            })}
        </div>
    );
}

/* ── SVG Sparkline (fully responsive via viewBox + preserveAspectRatio="none") ── */
function Sparkline({ data, color = '#3b5999' }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const H = 60;
    const W = 200;
    const padX = 4;
    const padY = 6;

    const points = data.map((v, i) => {
        const x = padX + (i / (data.length - 1)) * (W - padX * 2);
        const y = padY + (1 - (v - min) / (max - min || 1)) * (H - padY * 2);
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = [
        `${padX},${H}`,
        ...data.map((v, i) => {
            const x = padX + (i / (data.length - 1)) * (W - padX * 2);
            const y = padY + (1 - (v - min) / (max - min || 1)) * (H - padY * 2);
            return `${x},${y}`;
        }),
        `${W - padX},${H}`,
    ].join(' ');

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: H, display: 'block' }}
        >
            <defs>
                <linearGradient id={`sparkGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints}
                fill={`url(#sparkGrad-${color.replace('#','')})`} />
            <polyline points={points}
                fill="none" stroke={color} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            {/* Highlight last point */}
            {(() => {
                const last = data[data.length - 1];
                const x = W - padX;
                const y = padY + (1 - (last - min) / (max - min || 1)) * (H - padY * 2);
                return <circle cx={x} cy={y} r="4" fill={color} />;
            })()}
        </svg>
    );
}

/* ── Circular progress ring ── */
function ProgressRing({ value, max, size = 68, color = '#d44332', label }) {
    const ringRef = useRef(null);
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    useEffect(() => {
        if (ringRef.current)
            gsap.fromTo(ringRef.current,
                { strokeDashoffset: circ },
                { strokeDashoffset: circ * (1 - value / max), duration: 1.3, ease: 'power3.out' }
            );
    }, [value]);
    return (
        <div className="progress-ring-wrap">
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke="rgba(0,0,0,0.07)" strokeWidth="7" />
                <circle ref={ringRef} cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={circ}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
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
        if (fillRef.current)
            gsap.fromTo(fillRef.current,
                { width: '0%' },
                { width: `${level}%`, duration: 1, delay: 0.3, ease: 'power3.out' }
            );
    }, [level]);
    const color = level > 85 ? '#d44332' : level > 70 ? '#3b5999' : '#0080b2';
    return (
        <div className="skill-bar-row">
            <div className="skill-bar-label">
                <span>{name}</span>
                <span className="skill-pct" style={{ color }}>{level}%</span>
            </div>
            <div className="skill-bar-track">
                <div ref={fillRef} className="skill-bar-fill" style={{ background: color }} />
            </div>
        </div>
    );
}

/* ── Main HomePage ── */
export default function HomePage() {
    const [data, setData] = useState(null);
    const [feed, setFeed] = useState([]);
    const [collaborators, setCollaborators] = useState([]);
    const navigate = useNavigate();
    const pageRef = useRef(null);
    const sectionsRef = useRef([]);

    useEffect(() => {
        getDashboardOverview().then(setData);
        getLiveFeed().then(setFeed);
        getDashboardAnalytics()
            .then(a => setCollaborators(a?.collaborators || []))
            .catch(() => { });
    }, []);

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
        if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el);
    }, []);

    if (!data) return (
        <div style={{ padding: 40, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="home-spinner" /> Loading…
        </div>
    );

    return (
        <div ref={pageRef} className="home-page">
            <div ref={addSection} className="page-header">
                <h1 className="page-title">Welcome back 👋</h1>
                <p className="page-subtitle">Here's what's happening with your network</p>
            </div>

            <div className="home-two-col">
                {/* ─── LEFT: Live Feed ─── */}
                <div ref={addSection} className="live-feed-panel">
                    <h2 className="feed-panel-title">
                        <Zap size={18} /> Live Feed
                        <span className="section-badge">{feed.length} updates</span>
                    </h2>
                    <div className="feed-list">
                        {feed.map(item => (
                            <div
                                key={item.id}
                                className="feed-item"
                                onClick={() => navigate(item.type === 'project' ? '/dashboard/projects' : '/dashboard/forums')}
                            >
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
                                    {item.tags.map(tag => <span key={tag} className="feed-tag">{tag}</span>)}
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

                {/* ─── RIGHT: Analytics Panel ─── */}
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
                                <div className={`stat-icon-sm ${iconClass}`}><Icon size={15} /></div>
                                <div className="stat-info-compact">
                                    <span className="stat-value-compact">{data[key] ?? 0}</span>
                                    <span className="stat-label-compact">{label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Post Activity Bar Chart ── */}
                    <FrostCard flat>
                        <h3 className="section-title">
                            <BarChart3 size={16} /> Post Activity
                            <span className="section-badge">This Week</span>
                        </h3>
                        <BarChart data={weeklyPostData} labels={weekLabels} color="#d44332" height={120} />
                        <div className="chart-summary">
                            <div><span className="chart-big">325</span> total</div>
                            <div className="chart-trend up"><TrendingUp size={13} /> +18%</div>
                        </div>
                    </FrostCard>

                    {/* ── Follower Growth Sparkline ── */}
                    <FrostCard flat>
                        <h3 className="section-title">
                            <TrendingUp size={16} /> Network Growth
                            <span className="section-badge">12 months</span>
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                            <span className="chart-big">{monthlyFollowers[monthlyFollowers.length - 1]}</span>
                            <span className="chart-trend up"><TrendingUp size={12} /> +{Math.round(((monthlyFollowers[11] - monthlyFollowers[0]) / monthlyFollowers[0]) * 100)}%</span>
                        </div>
                        <Sparkline data={monthlyFollowers} color="#3b5999" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            {monthLabels.filter((_, i) => i % 2 === 0).map((l, idx) => (
                                <span key={idx} style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{l}</span>
                            ))}
                        </div>
                    </FrostCard>

                    {/* ── Engagement Breakdown ── */}
                    <FrostCard flat>
                        <h3 className="section-title"><Zap size={16} /> Engagement</h3>
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

                    {/* ── Activity Streak ── */}
                    <FrostCard flat>
                        <h3 className="section-title"><Flame size={16} /> Activity Streak</h3>
                        <div className="streak-content">
                            <ProgressRing value={streakData.current} max={streakData.best} size={68} color="#d44332" label="day streak" />
                            <div className="streak-stats">
                                <div><span className="streak-num">{streakData.best}</span><span className="streak-sub"> best</span></div>
                                <div><span className="streak-num">{streakData.total}</span><span className="streak-sub"> total</span></div>
                            </div>
                        </div>
                    </FrostCard>

                    {/* ── Top Skills ── */}
                    <FrostCard flat>
                        <h3 className="section-title"><Award size={16} /> Top Skills</h3>
                        <div className="skills-list">
                            {topSkills.map(({ name, level }) => <SkillBar key={name} name={name} level={level} />)}
                        </div>
                    </FrostCard>

                    {/* ── Upcoming ── */}
                    <FrostCard flat>
                        <h3 className="section-title"><CalendarDays size={16} /> Upcoming</h3>
                        <div className="events-list">
                            {upcomingEvents.map(evt => (
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

                    {/* ── Collaborators ── */}
                    {collaborators.length > 0 && (
                        <FrostCard flat>
                            <h3 className="section-title"><UserPlus size={16} /> Collaborators</h3>
                            <div className="collaborators-row" style={{ flexDirection: 'column' }}>
                                {collaborators.slice(0, 3).map(user => (
                                    <div key={user.id} className="collaborator-chip">
                                        <Avatar src={user.avatar} alt={user.name} size="xs" online={user.online} />
                                        <div>
                                            <div className="collaborator-name">{user.name}</div>
                                            <div className="collaborator-major">{user.major}</div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            style={{ marginLeft: 'auto', fontSize: '0.68rem' }}
                                            onClick={() => navigate('/dashboard/chat')}
                                        >
                                            <MessageCircle size={11} /> Msg
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </FrostCard>
                    )}
                </div>
            </div>
        </div>
    );
}
