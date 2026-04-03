import React, { useState, useEffect } from 'react';
import {
    User, Lock, Bell, Accessibility, Save, ChevronDown, Check, X as XIcon
} from 'lucide-react';
import FrostCard from '../components/FrostCard';
import Avatar from '../components/Avatar';
import { useToast } from '../components/Toast';
import { getCurrentUser, updateProfile, getNotificationSettings, updateNotificationSettings } from '../data/api';

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
    const addToast = useToast();

    useEffect(() => {
        getCurrentUser().then(setProfile);
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
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleSaveProfile}>
                    <Save size={15} /> Save Profile
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
        </div>
    );
}
