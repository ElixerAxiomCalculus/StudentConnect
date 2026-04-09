import React, { useRef, useEffect, useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Home, MessageCircle, FolderKanban, MessagesSquare,
    Users, Settings, LogOut
} from 'lucide-react';
import gsap from 'gsap';
import Avatar from './Avatar';
import { useAuth } from '../../../context/AuthContext';
import { getNotificationCounts } from '../data/api';

const NAV_ITEMS = [
    { to: '/dashboard', icon: Home, label: 'Home', end: true },
    { to: '/dashboard/chat', icon: MessageCircle, label: 'Chat', badgeKey: 'chat' },
    { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects', badgeKey: 'projects' },
    { to: '/dashboard/forums', icon: MessagesSquare, label: 'Forums', badgeKey: 'forums' },
    { to: '/dashboard/groups', icon: Users, label: 'Groups' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const location = useLocation();
    const { user } = useAuth();
    const currentUser = {
        name: user?.name || 'Student',
        avatar: user?.avatar || 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Student',
        major: user?.major || 'Undeclared',
        online: true,
    };
    const [badgeCounts, setBadgeCounts] = useState({ chat: 0, projects: 0, forums: 0 });
    const sidebarRef = useRef(null);
    const navItemsRef = useRef([]);
    const brandingRef = useRef(null);
    const profileRef = useRef(null);
    const dividerRef = useRef(null);

    // Staggered entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(sidebarRef.current,
                { x: -100, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
            );
            gsap.fromTo(brandingRef.current,
                { y: -30, opacity: 0, scale: 0.7 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 0.3, ease: 'back.out(1.7)' }
            );
            gsap.fromTo(profileRef.current,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, delay: 0.5, ease: 'power2.out' }
            );
            gsap.fromTo(dividerRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 0.4, delay: 0.6, ease: 'power2.out' }
            );
            gsap.fromTo(navItemsRef.current,
                { x: -40, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.45, stagger: 0.07, delay: 0.55, ease: 'power3.out' }
            );
        }, sidebarRef);
        return () => ctx.revert();
    }, []);

    // Fetch live badge counts on mount and when route changes
    useEffect(() => {
        let cancelled = false;
        getNotificationCounts()
            .then(data => { if (!cancelled) setBadgeCounts(data); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [location.pathname]);

    const handleNavHover = useCallback((e, entering) => {
        const el = e.currentTarget;
        if (entering) {
            gsap.to(el, { x: 6, scale: 1.02, duration: 0.3, ease: 'power2.out' });
            const icon = el.querySelector('.sidebar-nav-icon');
            if (icon) gsap.to(icon, { scale: 1.2, rotation: 8, duration: 0.3, ease: 'power2.out' });
        } else {
            gsap.to(el, { x: 0, scale: 1, duration: 0.25, ease: 'power2.inOut' });
            const icon = el.querySelector('.sidebar-nav-icon');
            if (icon) gsap.to(icon, { scale: 1, rotation: 0, duration: 0.25, ease: 'power2.inOut' });
        }
    }, []);

    return (
        <aside
            ref={sidebarRef}
            className="sidebar frost-panel"
            role="navigation"
            aria-label="Dashboard navigation"
        >
            {/* Geometric dot-grid background */}
            <div className="sidebar-geo-bg" aria-hidden="true">
                <div className="sidebar-geo-ring sidebar-geo-ring-1" />
                <div className="sidebar-geo-ring sidebar-geo-ring-2" />
                <div className="sidebar-geo-ring sidebar-geo-ring-3" />
                <div className="sidebar-geo-accent sidebar-geo-accent-top" />
                <div className="sidebar-geo-accent sidebar-geo-accent-bottom" />
            </div>

            <div className="sidebar-inner">
                {/* Branding */}
                <div ref={brandingRef} className="sidebar-branding">
                    <span className="sidebar-branding-name">
                        <span className="brand-student">Student</span>
                        <span className="brand-connect">Connect</span>
                    </span>
                </div>

                {/* Profile */}
                <div ref={profileRef} className="sidebar-profile">
                    <Avatar
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        size="lg"
                        online={currentUser.online}
                    />
                    <span className="sidebar-profile-name">{currentUser.name}</span>
                    <span className="sidebar-profile-role">{currentUser.major}</span>
                </div>

                <div ref={dividerRef} className="sidebar-divider" />

                {/* Nav */}
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(({ to, icon: Icon, label, badgeKey, end }, idx) => {
                        const badge = badgeKey ? badgeCounts[badgeKey] || 0 : 0;
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                ref={el => navItemsRef.current[idx] = el}
                                className={({ isActive }) =>
                                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                                }
                                aria-label={label}
                                aria-current={location.pathname === to ? 'page' : undefined}
                                onMouseEnter={(e) => handleNavHover(e, true)}
                                onMouseLeave={(e) => handleNavHover(e, false)}
                            >
                                <span className="nav-icon-wrap">
                                    <Icon className="sidebar-nav-icon" size={20} />
                                    {badge > 0 && (
                                        <span className="nav-badge" aria-label={`${badge} notifications`}>
                                            {badge}
                                        </span>
                                    )}
                                </span>
                                <span className="sidebar-nav-label">{label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Logout */}
            <div className="sidebar-logout">
                <NavLink
                    to="/dashboard/logout"
                    ref={el => navItemsRef.current[NAV_ITEMS.length] = el}
                    className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                    aria-label="Log Out"
                    onMouseEnter={(e) => handleNavHover(e, true)}
                    onMouseLeave={(e) => handleNavHover(e, false)}
                >
                    <LogOut className="sidebar-nav-icon" size={20} />
                    <span className="sidebar-nav-label">Log Out</span>
                </NavLink>
            </div>
        </aside>
    );
}
