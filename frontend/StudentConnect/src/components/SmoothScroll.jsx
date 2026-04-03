import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { useLocation } from 'react-router-dom';

let activeLenis = null;

export function scrollToTarget(target, options = {}) {
    if (typeof window === 'undefined') {
        return;
    }

    if (activeLenis) {
        activeLenis.scrollTo(target, {
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
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
    }

    if (target instanceof Element) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

export default function SmoothScroll({ children }) {
    const location = useLocation();
    const frameRef = useRef(0);
    const lenisRef = useRef(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (location.pathname !== '/' || prefersReducedMotion) {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = 0;
            }
            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
            }
            activeLenis = null;
            return undefined;
        }

        const lenis = new Lenis({
            duration: 1.05,
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.4,
        });

        lenisRef.current = lenis;
        activeLenis = lenis;

        const raf = (time) => {
            lenis.raf(time);
            frameRef.current = requestAnimationFrame(raf);
        };

        frameRef.current = requestAnimationFrame(raf);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = 0;
            }
            if (activeLenis === lenis) {
                activeLenis = null;
            }
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [location.pathname]);

    useEffect(() => {
        if (location.pathname === '/') {
            scrollToTarget(0, { immediate: true, offset: 0 });
            return;
        }

        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.pathname]);

    return <>{children}</>;
}
