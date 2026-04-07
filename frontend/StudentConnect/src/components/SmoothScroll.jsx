import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Delegate to window.lenis (set by LandingPage) when on '/', otherwise fall back to native scroll.
export function scrollToTarget(target, options = {}) {
    if (typeof window === 'undefined') return;

    const lenis = window.lenis;
    if (lenis) {
        lenis.scrollTo(target, {
            offset: options.offset ?? -96,
            duration: options.duration ?? 1.05,
            immediate: options.immediate ?? false,
            lock: options.lock ?? false,
        });
        return;
    }

    if (typeof target === 'number') {
        window.scrollTo({ top: target, left: 0, behavior: 'smooth' });
        return;
    }

    if (typeof target === 'string') {
        const element = document.querySelector(target);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    if (target instanceof Element) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// SmoothScroll only handles scroll-to-top on route change.
// Lenis instantiation for '/' is owned entirely by LandingPage to avoid two
// instances fighting each other and causing jitter on scroll stop.
export default function SmoothScroll({ children }) {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            // LandingPage owns Lenis; let it settle before jumping to top.
            if (window.lenis) {
                window.lenis.scrollTo(0, { immediate: true });
            } else {
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            }
            return;
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.pathname]);

    return <>{children}</>;
}
