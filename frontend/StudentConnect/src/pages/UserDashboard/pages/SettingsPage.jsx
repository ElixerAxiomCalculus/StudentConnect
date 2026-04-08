import React, { useState, useEffect } from 'react';
import {
    User, Lock, Bell, Accessibility, Save, ChevronDown, Check, X as XIcon,
    Target, Clock, Link2, Trash2, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FrostCard from '../components/FrostCard';
import Avatar from '../components/Avatar';
import { useToast } from '../components/Toast';
import { useAuth } from '../../../context/AuthContext';
import { getCurrentUser, updateProfile, getNotificationSettings, updateNotificationSettings, deleteAccount } from '../data/api';

/* ── Match profile data ── */
const SKILLS_OFFER_LIST = ['Web Dev', 'AI / ML', 'UI / UX', 'Mobile Dev', 'Data Science', 'Cloud/DevOps', 'Cybersecurity', 'Marketing', 'Presentation', 'Content Writing'];
const SKILLS_SEEK_LIST  = ['UI / UX', 'Data Science', 'Marketing', 'Research', 'Project Mgmt', 'Finance', 'Sales / BD', 'Video Editing'];
const GOALS_LIST = ['Startup / Product', 'Hackathons', 'Research / Papers', 'Study Partner', 'Social Impact', 'Game Development'];
const DAYS_LIST  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS_LIST = ['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Night Owl'];
const MATCH_TYPES = ['Complementary Skills', 'Similar to Me', 'Diverse Background', 'Surprise Me!'];

function TagToggle({ items, selected = [], onChange }) {
    const toggle = (item) => {
        const next = selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item];
        onChange(next);
    };
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {items.map(item => (
                <button
                    key={item}
                    type="button"
                    onClick={() => toggle(item)}
                    style={{
                        padding: '7px 14px', borderRadius: '99px', fontSize: '12.5px', fontWeight: 500,
                        border: `1.5px solid ${selected.includes(item) ? 'var(--accent-3)' : 'rgba(0,0,0,0.12)'}`,
                        background: selected.includes(item) ? 'var(--accent-3)' : 'rgba(255,255,255,0.6)',
                        color: selected.includes(item) ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer', transition: 'all 0.18s',
                    }}
                >
                    {item}
                </button>
            ))}
        </div>
    );
}

/* ── 50 doodle-style avatar options using DiceBear fun-emoji ── */
const AVATAR_SEEDS = [
    'Whiskers','Stardust','Cosmo','Blaze','Nova','Pixel','Cipher','Echo',
    'Lyra','Orbit','Sage','Flux','Ripple','Zenith','Prism','Glow',
    'Drift','Sparky','Celeste','Nimbus','Ember','Solaris','Vortex','Quasar',
    'Titan','Aether','Zephyr','Comet','Nebula','Aurora','Pulsar','Rogue',
    'Axiom','Cipher','Zenon','Helios','Mira','Elara','Crest','Lumen',
    'Orion','Lyric','Indigo','Vermeil','Cobalt','Sable','Ivory','Garnet',
    'Onyx','Flint',
];

function avatarUrl(seed) {
    return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`;
}

/* ── Avatar Picker Dropdown ── */
function AvatarPicker({ currentSeed, onSelect }) {
    const [open, setOpen] = useState(false);

    const handleSelect = (seed) => {
        onSelect(avatarUrl(seed));
        setOpen(false);
    };

    return (
        <div className="avatar-picker-wrap">
            <button
                className="btn btn-secondary"
                style={{ gap: 8 }}
                onClick={() => setOpen(v => !v)}
                type="button"
            >
                <img
                    src={currentSeed || avatarUrl('Student')}
                    alt="Current avatar"
                    style={{ width: 22, height: 22, borderRadius: '50%', background: '#f0f0f0' }}
                />
                Change Avatar
                <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>

            {open && (
                <div className="avatar-picker-dropdown">
                    <div className="avatar-picker-header">
                        <span>Choose your doodle avatar</span>
                        <button className="btn-icon" style={{ width: 26, height: 26 }} onClick={() => setOpen(false)}>
                            <XIcon size={13} />
                        </button>
                    </div>
                    <div className="avatar-picker-grid">
                        {AVATAR_SEEDS.map((seed) => {
                            const url = avatarUrl(seed);
                            const isActive = currentSeed === url;
                            return (
                                <button
                                    key={seed}
                                    className={`avatar-option ${isActive ? 'selected' : ''}`}
                                    onClick={() => handleSelect(seed)}
                                    title={seed}
                                    type="button"
                                >
                                    <img src={url} alt={seed} loading="lazy" />
                                    {isActive && (
                                        <span className="avatar-option-check">
                                            <Check size={10} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Main Settings Page ── */
export default function SettingsPage() {
    const [profile, setProfile] = useState(null);
    const [notifs, setNotifs] = useState(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [textScale, setTextScale] = useState(100);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const addToast = useToast();
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        getCurrentUser().then(data => {
            setProfile(data);
        });
        getNotificationSettings().then(setNotifs);
    }, []);

    const handleSaveProfile = async () => {
        await updateProfile(profile);
        addToast?.('Profile updated successfully!', 'success');
    };

    const handleSaveNotifs = async () => {
        await updateNotificationSettings(notifs);
        addToast?.('Notification settings saved!', 'success');
    };

    const handleInterestRemove = (interest) => {
        setProfile(p => ({ ...p, interests: p.interests.filter(i => i !== interest) }));
    };

    const handleAddInterest = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            setProfile(p => ({ ...p, interests: [...(p.interests || []), e.target.value.trim()] }));
            e.target.value = '';
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setDeleting(true);
        try {
            await deleteAccount();
            logout();
            navigate('/auth');
        } catch {
            addToast?.('Failed to delete account. Please try again.', 'error');
            setDeleting(false);
        }
    };

    if (!profile || !notifs) {
        return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Loading…</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your profile and preferences</p>
            </div>

            {/* Profile */}
            <FrostCard flat className="settings-section">
                <h3 className="settings-section-title"><User size={18} /> Profile</h3>

                {/* Avatar section */}
                <div className="avatar-upload" style={{ marginBottom: 24 }}>
                    <div className="avatar-preview-wrap">
                        <Avatar src={profile.avatar} alt={profile.name} size="xl" online />
                        <div className="avatar-preview-glow" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Profile Avatar
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Pick from 50 doodle characters
                        </span>
                        <AvatarPicker
                            currentSeed={profile.avatar}
                            onSelect={(url) => setProfile(p => ({ ...p, avatar: url }))}
                        />
                    </div>
                </div>

                <div className="settings-grid">
                    <div className="settings-field">
                        <label className="settings-label">Display Name</label>
                        <input
                            className="input"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label">Email</label>
                        <input className="input" value={profile.email || ''} disabled style={{ opacity: 0.6 }} />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label">Major</label>
                        <input
                            className="input"
                            value={profile.major}
                            onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                        />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label">Semester</label>
                        <input
                            className="input"
                            type="number"
                            value={profile.semester || ''}
                            onChange={(e) => setProfile({ ...profile, semester: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>
                <div className="settings-field" style={{ marginTop: 14 }}>
                    <label className="settings-label">Bio</label>
                    <textarea
                        className="settings-textarea"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                </div>
                <div className="settings-field" style={{ marginTop: 14 }}>
                    <label className="settings-label">Interests</label>
                    <div className="interest-tags">
                        {profile.interests?.map((interest) => (
                            <span key={interest} className="interest-tag">
                                {interest}
                                <button
                                    className="interest-tag-remove"
                                    onClick={() => handleInterestRemove(interest)}
                                    aria-label={`Remove ${interest}`}
                                >
                                    <XIcon size={10} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        className="input"
                        placeholder="Add interest (press Enter)"
                        onKeyDown={handleAddInterest}
                        style={{ marginTop: 8, maxWidth: 300 }}
                    />
                </div>

                {/* Professional Links */}
                <div style={{ marginTop: 20 }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Link2 size={14} /> Professional Links
                    </h4>
                    <div className="settings-grid">
                        <div className="settings-field">
                            <label className="settings-label">GitHub Username</label>
                            <input
                                className="input"
                                value={profile.github || ''}
                                onChange={e => setProfile({ ...profile, github: e.target.value })}
                                placeholder="your-username"
                            />
                        </div>
                        <div className="settings-field">
                            <label className="settings-label">LinkedIn URL</label>
                            <input
                                className="input"
                                value={profile.linkedin || ''}
                                onChange={e => setProfile({ ...profile, linkedin: e.target.value })}
                                placeholder="linkedin.com/in/you"
                            />
                        </div>
                        <div className="settings-field">
                            <label className="settings-label">College / University</label>
                            <input
                                className="input"
                                value={profile.college || ''}
                                onChange={e => setProfile({ ...profile, college: e.target.value })}
                                placeholder="e.g. MIT, IIT Delhi"
                            />
                        </div>
                        <div className="settings-field">
                            <label className="settings-label">Department</label>
                            <input
                                className="input"
                                value={profile.department || ''}
                                onChange={e => setProfile({ ...profile, department: e.target.value })}
                                placeholder="e.g. Computer Science"
                            />
                        </div>
                    </div>
                </div>

                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleSaveProfile}>
                    <Save size={15} /> Save Profile
                </button>
            </FrostCard>

            {/* Match Profile — Skills & Goals */}
            <FrostCard flat className="settings-section">
                <h3 className="settings-section-title"><Target size={18} /> Match Profile</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                    These preferences power the matching algorithm. Update them anytime to refine your recommendations.
                </p>

                <div className="settings-field" style={{ marginBottom: 18 }}>
                    <label className="settings-label">Skills I Can Offer</label>
                    <TagToggle
                        items={SKILLS_OFFER_LIST}
                        selected={profile.skills_offer || []}
                        onChange={v => setProfile({ ...profile, skills_offer: v })}
                    />
                </div>

                <div className="settings-field" style={{ marginBottom: 18 }}>
                    <label className="settings-label">Skills I'm Looking For in a Partner</label>
                    <TagToggle
                        items={SKILLS_SEEK_LIST}
                        selected={profile.skills_seek || []}
                        onChange={v => setProfile({ ...profile, skills_seek: v })}
                    />
                </div>

                <div className="settings-field" style={{ marginBottom: 18 }}>
                    <label className="settings-label">What I Want to Work On</label>
                    <TagToggle
                        items={GOALS_LIST}
                        selected={profile.goals || []}
                        onChange={v => setProfile({ ...profile, goals: v })}
                    />
                </div>

                <div className="settings-field" style={{ marginBottom: 18 }}>
                    <label className="settings-label">I Want to Match With</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {MATCH_TYPES.map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setProfile({ ...profile, match_type: type })}
                                style={{
                                    padding: '7px 14px', borderRadius: '99px', fontSize: '12.5px', fontWeight: 500,
                                    border: `1.5px solid ${profile.match_type === type ? 'var(--accent-3)' : 'rgba(0,0,0,0.12)'}`,
                                    background: profile.match_type === type ? 'var(--accent-3)' : 'rgba(255,255,255,0.6)',
                                    color: profile.match_type === type ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer', transition: 'all 0.18s',
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="btn btn-primary" style={{ marginTop: 4 }} onClick={handleSaveProfile}>
                    <Save size={15} /> Save Match Profile
                </button>
            </FrostCard>

            {/* Availability */}
            <FrostCard flat className="settings-section">
                <h3 className="settings-section-title"><Clock size={18} /> Availability</h3>

                <div className="settings-field" style={{ marginBottom: 18 }}>
                    <label className="settings-label">Days I'm Available</label>
                    <TagToggle
                        items={DAYS_LIST}
                        selected={profile.availability_days || []}
                        onChange={v => setProfile({ ...profile, availability_days: v })}
                    />
                </div>

                <div className="settings-field" style={{ marginBottom: 18 }}>
                    <label className="settings-label">Preferred Working Hours</label>
                    <TagToggle
                        items={HOURS_LIST}
                        selected={profile.availability_hours || []}
                        onChange={v => setProfile({ ...profile, availability_hours: v })}
                    />
                </div>

                <div className="settings-field" style={{ marginBottom: 4 }}>
                    <label className="settings-label">Weekly Commitment</label>
                    <input
                        className="input"
                        value={profile.weekly_commitment || ''}
                        onChange={e => setProfile({ ...profile, weekly_commitment: e.target.value })}
                        placeholder="e.g. 6–8 hrs/week"
                        style={{ maxWidth: 240 }}
                    />
                </div>

                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSaveProfile}>
                    <Save size={15} /> Save Availability
                </button>
            </FrostCard>

            {/* Privacy */}
            <FrostCard flat className="settings-section">
                <h3 className="settings-section-title"><Lock size={18} /> Privacy Controls</h3>
                <div className="toggle-row">
                    <span className="toggle-label">Profile visible to everyone</span>
                    <button className="toggle active" onClick={() => { }} aria-label="Toggle profile visibility" />
                </div>
                <div className="toggle-row">
                    <span className="toggle-label">Allow messages from anyone</span>
                    <button className="toggle active" onClick={() => { }} aria-label="Toggle message permissions" />
                </div>
                <div className="toggle-row">
                    <span className="toggle-label">Allow project invites</span>
                    <button className="toggle active" onClick={() => { }} aria-label="Toggle project invite permissions" />
                </div>
            </FrostCard>

            {/* Notifications */}
            <FrostCard flat className="settings-section">
                <h3 className="settings-section-title"><Bell size={18} /> Notifications</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                    {['email', 'push', 'inApp'].map((channel) => (
                        <div key={channel}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-4)', marginBottom: 10, textTransform: 'capitalize' }}>
                                {channel === 'inApp' ? 'In-App' : channel}
                            </h4>
                            {Object.entries(notifs[channel] || {}).map(([key, val]) => (
                                <div key={key} className="toggle-row">
                                    <span className="toggle-label" style={{ textTransform: 'capitalize' }}>{key}</span>
                                    <button
                                        className={`toggle ${val ? 'active' : ''}`}
                                        onClick={() => setNotifs({
                                            ...notifs,
                                            [channel]: { ...notifs[channel], [key]: !val },
                                        })}
                                        aria-label={`Toggle ${channel} ${key} notifications`}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleSaveNotifs}>
                    <Save size={15} /> Save Notifications
                </button>
            </FrostCard>

            {/* Accessibility */}
            <FrostCard flat className="settings-section">
                <h3 className="settings-section-title"><Accessibility size={18} /> Accessibility</h3>
                <div className="toggle-row">
                    <span className="toggle-label">Reduced motion</span>
                    <button
                        className={`toggle ${reducedMotion ? 'active' : ''}`}
                        onClick={() => {
                            setReducedMotion(!reducedMotion);
                            document.documentElement.style.setProperty('--transition-fast', reducedMotion ? '200ms' : '0ms');
                            document.documentElement.style.setProperty('--transition-medium', reducedMotion ? '320ms' : '0ms');
                        }}
                        aria-label="Toggle reduced motion"
                    />
                </div>
                <div className="toggle-row">
                    <span className="toggle-label">High contrast theme</span>
                    <button
                        className={`toggle ${highContrast ? 'active' : ''}`}
                        onClick={() => {
                            setHighContrast(!highContrast);
                            document.documentElement.style.setProperty('--glass-bg', highContrast ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.85)');
                        }}
                        aria-label="Toggle high contrast"
                    />
                </div>
                <div className="toggle-row">
                    <span className="toggle-label">Text size: {textScale}%</span>
                    <input
                        type="range" min="80" max="140" step="10"
                        value={textScale}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTextScale(val);
                            document.documentElement.style.fontSize = `${val}%`;
                        }}
                        style={{ width: 120 }}
                        aria-label="Adjust text size"
                    />
                </div>
            </FrostCard>

            {/* Danger Zone – Delete Account */}
            <FrostCard flat className="settings-section" style={{ borderLeft: '3px solid var(--danger, #e53e3e)' }}>
                <h3 className="settings-section-title" style={{ color: 'var(--danger, #e53e3e)' }}>
                    <Trash2 size={18} /> Danger Zone
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    Permanently delete your account and all associated data including chats, connections, and project memberships. This action cannot be undone.
                </p>
                {!showDeleteConfirm ? (
                    <button
                        className="btn"
                        style={{
                            background: 'var(--danger, #e53e3e)',
                            color: '#fff',
                            border: 'none',
                        }}
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 size={15} /> Delete Account
                    </button>
                ) : (
                    <div style={{
                        background: 'rgba(229,62,62,0.08)',
                        borderRadius: 10,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger, #e53e3e)', fontWeight: 600, fontSize: '0.9rem' }}>
                            <AlertTriangle size={16} /> Are you absolutely sure?
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                            Type <strong>DELETE</strong> below to confirm account deletion.
                        </p>
                        <input
                            type="text"
                            className="input"
                            placeholder="Type DELETE to confirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            style={{ maxWidth: 260 }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                className="btn"
                                style={{
                                    background: 'var(--danger, #e53e3e)',
                                    color: '#fff',
                                    border: 'none',
                                    opacity: deleteConfirmText !== 'DELETE' || deleting ? 0.5 : 1,
                                }}
                                disabled={deleteConfirmText !== 'DELETE' || deleting}
                                onClick={handleDeleteAccount}
                            >
                                <Trash2 size={15} /> {deleting ? 'Deleting...' : 'Permanently Delete'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </FrostCard>
        </div>
    );
}
