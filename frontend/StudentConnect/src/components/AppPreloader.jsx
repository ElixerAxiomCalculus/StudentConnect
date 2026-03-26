import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function AppPreloader({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Simulate a smooth, variable-speed loading sequence
        let currentProgress = 0;
        let animationFrame;

        const animateProgress = () => {
            if (currentProgress >= 100) {
                setProgress(100);
                setTimeout(() => {
                    setIsVisible(false);
                    setTimeout(onComplete, 800); // Wait for exit animation
                }, 400); // Brief pause at 100%
                return;
            }

            // Variable speed: fast start, slow middle, fast finish
            let increment = 0;
            if (currentProgress < 30) increment = 2.5;
            else if (currentProgress < 75) increment = 0.8;
            else increment = 3.0;

            // Add randomness for an organic feel
            currentProgress += increment * (0.8 + Math.random() * 0.4);

            if (currentProgress > 100) currentProgress = 100;
            setProgress(Math.floor(currentProgress));

            // Determine next frame delay
            const delay = currentProgress > 30 && currentProgress < 75 ?
                30 + Math.random() * 40 :
                16;

            animationFrame = setTimeout(animateProgress, delay);
        };

        animationFrame = setTimeout(animateProgress, 100);

        return () => clearTimeout(animationFrame);
    }, [onComplete]);

    // SVG Circle Calculations
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="app-preloader"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        backdropFilter: 'blur(0px)',
                        scale: 1.05
                    }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div className="preloader-bg-glow" />

                    <motion.div
                        className="preloader-content"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                    >
                        {/* Radial Ring */}
                        <div className="preloader-ring-container">
                            <svg className="preloader-svg" width="160" height="160" viewBox="0 0 160 160">
                                <defs>
                                    <linearGradient id="preloader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#d44332" />
                                        <stop offset="50%" stopColor="#00aced" />
                                        <stop offset="100%" stopColor="#0080b2" />
                                    </linearGradient>
                                </defs>
                                {/* Track */}
                                <circle
                                    className="preloader-track"
                                    cx="80" cy="80" r={radius}
                                    strokeWidth="6"
                                    fill="none"
                                />
                                {/* Progress */}
                                <circle
                                    className="preloader-progress"
                                    cx="80" cy="80" r={radius}
                                    strokeWidth="6"
                                    fill="none"
                                    strokeLinecap="round"
                                    style={{
                                        strokeDasharray: circumference,
                                        strokeDashoffset: strokeDashoffset,
                                    }}
                                />
                            </svg>

                            {/* Inner Content */}
                            <div className="preloader-inner-text">
                                <span className="preloader-percent">{progress}%</span>
                            </div>

                            {/* Outer decorative spinning rings */}
                            <div className="preloader-spin-ring preloader-spin-1" />
                            <div className="preloader-spin-ring preloader-spin-2" />
                        </div>

                        {/* Branding */}
                        <div className="preloader-branding">
                            <h1 className="preloader-title">
                                <span className="brand-student">Student</span>
                                <span className="brand-connect">Connect</span>
                            </h1>
                            <p className="preloader-subtitle">
                                <Sparkles size={14} className="inline-sparkle" />
                                Connecting Minds Seamlessly
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
