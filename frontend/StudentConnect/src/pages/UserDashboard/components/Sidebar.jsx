import React, { useRef, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Home, MessageCircle, FolderKanban, MessagesSquare,
    Users, Settings, LogOut, Sparkles
} from 'lucide-react';
import gsap from 'gsap';
import Avatar from './Avatar';
import { currentUser } from '../data/mockData';

const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home', end: true },
    { to: '/dashboard/chat', icon: MessageCircle, label: 'Chat', badge: 4 },
    { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects', badge: 1 },
    { to: '/dashboard/forums', icon: MessagesSquare, label: 'Forums', badge: 2 },
    { to: '/dashboard/groups', icon: Users, label: 'Groups', upcoming: true },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
    const location = useLocation();
    const sidebarRef = useRef(null);
    const wavyRef = useRef(null);
    const bubblesRef = useRef(null);
    const navItemsRef = useRef([]);
    const brandingRef = useRef(null);
    const profileRef = useRef(null);
    const dividerRef = useRef(null);

    // Staggered entrance animation on mount
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Sidebar slides in from left
            gsap.fromTo(sidebarRef.current,
                { x: -100, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
            );

            // Branding drops in with bounce
            gsap.fromTo(brandingRef.current,
                { y: -30, opacity: 0, scale: 0.7 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 0.3, ease: 'back.out(1.7)' }
            );

            // Profile fades in
            gsap.fromTo(profileRef.current,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, delay: 0.5, ease: 'power2.out' }
            );

            // Divider grows in
            gsap.fromTo(dividerRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 0.4, delay: 0.6, ease: 'power2.out' }
            );

            // Nav items stagger in from left
            gsap.fromTo(navItemsRef.current,
                { x: -40, opacity: 0 },
                {
                    x: 0, opacity: 1,
                    duration: 0.45,
                    stagger: 0.07,
                    delay: 0.55,
                    ease: 'power3.out',
                }
            );
        }, sidebarRef);

        return () => ctx.revert();
    }, []);

    // Animate wavy SVG paths continuously
    useEffect(() => {
        if (!wavyRef.current) return;
        const paths = wavyRef.current.querySelectorAll('path');
        const ctx = gsap.context(() => {
            paths.forEach((path, i) => {
                // Each wave slightly different speed & amplitude
                gsap.to(path, {
                    attr: {
                        d: i === 0
                            ? 'M0,30 Q60,5 120,35 Q180,65 240,25 Q280,5 300,30'
                            : i === 1
                                ? 'M0,50 Q50,80 120,45 Q190,10 240,55 Q280,80 300,50'
                                : 'M0,70 Q70,40 140,75 Q200,100 260,60 Q290,45 300,70'
                    },
                    duration: 3 + i * 0.7,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                });
            });
        }, wavyRef);
        return () => ctx.revert();
    }, []);

    // Nav item hover micro-interaction
    const handleNavHover = useCallback((e, entering) => {
        const el = e.currentTarget;
        if (entering) {
            gsap.to(el, {
                x: 6,
                scale: 1.02,
                duration: 0.3,
                ease: 'power2.out',
            });
            // Glow the icon
            const icon = el.querySelector('.sidebar-nav-icon');
            if (icon) gsap.to(icon, { scale: 1.2, rotation: 8, duration: 0.3, ease: 'power2.out' });
        } else {
            gsap.to(el, { x: 0, scale: 1, duration: 0.25, ease: 'power2.inOut' });
            const icon = el.querySelector('.sidebar-nav-icon');
            if (icon) gsap.to(icon, { scale: 1, rotation: 0, duration: 0.25, ease: 'power2.inOut' });
        }
    }, []);

    // Click bubble effect — spawn expanding circles at click position
    const handleSidebarClick = useCallback((e) => {
        if (!bubblesRef.current) return;
        const rect = sidebarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const count = 3;
        for (let i = 0; i < count; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'sidebar-bubble';
            bubble.style.left = `${x}px`;
            bubble.style.top = `${y}px`;
            bubblesRef.current.appendChild(bubble);
            gsap.fromTo(bubble,
                { scale: 0, opacity: 0.6 },
                {
                    scale: 2 + i * 0.8,
                    opacity: 0,
                    duration: 0.7 + i * 0.15,
                    delay: i * 0.06,
                    ease: 'power2.out',
                    onComplete: () => bubble.remove(),
                }
            );
        }
    }, []);

    // Floating particles effect
    useEffect(() => {
        if (!bubblesRef.current) return;
        const container = bubblesRef.current;
        const ctx = gsap.context(() => {
            const createParticle = () => {
                const p = document.createElement('div');
                p.className = 'sidebar-particle';
                const size = 3 + Math.random() * 5;
                p.style.width = `${size}px`;
                p.style.height = `${size}px`;
                p.style.left = `${20 + Math.random() * 180}px`;
                p.style.top = `${Math.random() * 100}%`;
                container.appendChild(p);
                gsap.fromTo(p,
                    { y: 0, opacity: 0 },
                    {
                        y: -(60 + Math.random() * 100),
                        opacity: 0.35,
                        duration: 2.5 + Math.random() * 2,
                        ease: 'power1.out',
                        onComplete: () => {
                            gsap.to(p, {
                                opacity: 0,
                                duration: 0.6,
                                onComplete: () => p.remove()
                            });
                        }
                    }
                );
            };
            const interval = setInterval(createParticle, 2200);
            return () => clearInterval(interval);
        }, container);
        // Cleanup on unmount
        const interval = setInterval(() => { }, 2200);
        return () => { ctx.revert(); clearInterval(interval); };
    }, []);

    return (
        <aside
            ref={sidebarRef}
            className="sidebar frost-panel"
            role="navigation"
            aria-label="Dashboard navigation"
            onClick={handleSidebarClick}
        >
            {/* Wavy SVG background */}
            <svg
                ref={wavyRef}
                className="sidebar-wavy"
                viewBox="0 0 300 100"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path d="M0,30 Q50,10 120,40 Q180,70 240,20 Q280,0 300,30"
                    fill="none" stroke="rgba(212,67,50,0.08)" strokeWidth="1.5" />
                <path d="M0,50 Q60,80 130,40 Q200,10 250,60 Q280,80 300,50"
                    fill="none" stroke="rgba(0,128,178,0.06)" strokeWidth="1.2" />
                <path d="M0,70 Q80,50 150,80 Q210,100 270,55 Q290,40 300,70"
                    fill="none" stroke="rgba(59,89,153,0.05)" strokeWidth="1" />
            </svg>

            {/* Bubble / particle layer */}
            <div ref={bubblesRef} className="sidebar-bubbles-layer" aria-hidden="true" />

            {/* Inner Wrapper for scrolling calculation */}
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
                    {navItems.map(({ to, icon: Icon, label, badge, upcoming, end }, idx) => (
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
                                {badge > 0 && <span className="nav-dot" />}
                            </span>
                            <span className="sidebar-nav-label">{label}</span>
                            {upcoming && (
                                <span className="nav-upcoming-dot" />
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Logout */}
            <div className="sidebar-logout">
                <NavLink
                    to="/dashboard/logout"
                    ref={el => navItemsRef.current[navItems.length] = el}
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
