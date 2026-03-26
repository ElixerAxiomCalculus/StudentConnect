import React, { useEffect } from 'react';
import gsap from 'gsap';

export default function GlobalInteractions() {
    useEffect(() => {
        const attachGSAP = () => {
            const elements = document.querySelectorAll(
                '.btn, button, .project-card, .forum-thread-card, .chat-thread-card'
            );

            elements.forEach(el => {
                // Prevent duplicate listeners
                if (el.dataset.gsapInit) return;
                el.dataset.gsapInit = 'true';

                // Save initial box shadow if available
                const initialShadow = window.getComputedStyle(el).boxShadow;
                const baseShadow = (initialShadow && initialShadow !== 'none') ? initialShadow : '0 4px 20px rgba(0, 0, 0, 0.05)';

                el.addEventListener('mouseenter', () => {
                    gsap.to(el, {
                        scale: 1.02,
                        boxShadow: `0 10px 30px rgba(212, 67, 50, 0.2), ${baseShadow}`,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                });

                el.addEventListener('mouseleave', () => {
                    gsap.to(el, {
                        scale: 1,
                        boxShadow: baseShadow,
                        duration: 0.4,
                        ease: 'power2.out',
                        clearProps: 'scale,boxShadow'
                    });
                });
            });

            // Handle hover shift for glass panels
            const panels = document.querySelectorAll('.frost-panel');
            panels.forEach(panel => {
                if (panel.dataset.glassInit) return;
                panel.dataset.glassInit = 'true';

                panel.addEventListener('mouseenter', () => {
                    gsap.to(panel, {
                        backdropFilter: 'blur(35px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        duration: 0.4
                    });
                });

                panel.addEventListener('mouseleave', () => {
                    gsap.to(panel, {
                        backdropFilter: 'blur(20px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.30)',
                        duration: 0.4,
                        clearProps: 'backdropFilter,backgroundColor'
                    });
                });
            });
        };

        attachGSAP();

        const observer = new MutationObserver(() => {
            // Re-run safely for any new DOM elements added by React Router
            attachGSAP();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    return null;
}
