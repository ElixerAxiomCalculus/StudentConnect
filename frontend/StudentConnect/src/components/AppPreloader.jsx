import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────
   3D floating shapes (toon / doodle aesthetic)
───────────────────────────────────────────── */
function FloatShape({ position, color, geo, speed = 1, phase = 0, wireframe = false }) {
    const ref = useRef();
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = clock.elapsedTime * speed + phase;
        ref.current.rotation.x = Math.sin(t * 0.55) * 0.5;
        ref.current.rotation.y += 0.012 * speed;
        ref.current.rotation.z = Math.cos(t * 0.4) * 0.25;
        ref.current.position.y = position[1] + Math.sin(t * 0.48) * 0.28;
    });

    const mat = wireframe
        ? <meshBasicMaterial color={color} wireframe opacity={0.3} transparent />
        : <meshToonMaterial color={color} opacity={0.72} transparent />;

    let geometry;
    if (geo === 'torus')    geometry = <torusGeometry args={[0.5, 0.17, 10, 30]} />;
    else if (geo === 'oct') geometry = <octahedronGeometry args={[0.5]} />;
    else if (geo === 'ico') geometry = <icosahedronGeometry args={[0.44, 1]} />;
    else if (geo === 'cone')geometry = <coneGeometry args={[0.42, 0.82, 5]} />;
    else                    geometry = <boxGeometry args={[0.68, 0.68, 0.68]} />;

    return (
        <mesh ref={ref} position={position}>
            {geometry}
            {mat}
        </mesh>
    );
}

function Scene() {
    const shapes = [
        { position: [-3.4, 1.0, -1.8],  color: '#d44332', geo: 'box',   speed: 0.65 },
        { position: [ 3.1, -0.6, -2.2], color: '#3b5999', geo: 'torus', speed: 0.55, phase: 2 },
        { position: [-2.2, -2.0, -2.8], color: '#0080b2', geo: 'ico',   speed: 1.05, phase: 1 },
        { position: [ 2.7,  1.9, -2.3], color: '#d44332', geo: 'oct',   speed: 0.80, phase: 3 },
        { position: [ 0.5,  3.0, -3.2], color: '#3b5999', geo: 'box',   speed: 0.60, phase: 0.5 },
        { position: [-1.6,  0.4, -3.0], color: '#0080b2', geo: 'cone',  speed: 1.10, phase: 4 },
        { position: [ 1.8, -2.5, -2.5], color: '#d44332', geo: 'torus', speed: 0.75, phase: 1.5 },
        // Wireframe rings for the doodle feel
        { position: [ 1.2,  0.2, -2.8], color: '#d44332', geo: 'torus', speed: 0.38, wireframe: true },
        { position: [-0.8,  1.8, -3.2], color: '#3b5999', geo: 'torus', speed: 0.52, wireframe: true, phase: 2 },
        { position: [ 0.1, -1.6, -2.4], color: '#0080b2', geo: 'torus', speed: 0.30, wireframe: true, phase: 1 },
    ];
    return (
        <>
            <ambientLight intensity={1.0} color="#fff6f0" />
            <directionalLight position={[4, 6, 4]} intensity={1.4} color="#ffe8d6" />
            <pointLight position={[-4, -2, 3]} intensity={0.7} color="#d6e8ff" />
            {shapes.map((s, i) => <FloatShape key={i} {...s} />)}
        </>
    );
}

/* ─────────────────────────────────────────────
   Loading messages
───────────────────────────────────────────── */
const MESSAGES = [
    'Setting things up…',
    'Connecting students…',
    'Loading your network…',
    'Almost there…',
    'Welcome!',
];

/* ─────────────────────────────────────────────
   Main Preloader
───────────────────────────────────────────── */
export default function AppPreloader({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let current = 0;
        const tick = () => {
            if (current >= 100) {
                setProgress(100);
                setTimeout(() => {
                    setIsVisible(false);
                    setTimeout(onComplete, 720);
                }, 480);
                return;
            }
            const inc = current < 30 ? 3.0 : current < 75 ? 0.88 : 3.6;
            current = Math.min(100, current + inc * (0.78 + Math.random() * 0.44));
            setProgress(Math.floor(current));
            setTimeout(tick, current > 30 && current < 75 ? 28 + Math.random() * 42 : 14);
        };
        setTimeout(tick, 80);
    }, [onComplete]);

    const msgIdx = progress < 20 ? 0 : progress < 45 ? 1 : progress < 65 ? 2 : progress < 95 ? 3 : 4;
    const R = 66;
    const circ = 2 * Math.PI * R;
    const dashOffset = circ * (1 - progress / 100);

    // Doodle floating shapes (pure CSS, no Three.js)
    const doodles = [
        { cls: 'pl-d1' }, { cls: 'pl-d2' }, { cls: 'pl-d3' },
        { cls: 'pl-d4' }, { cls: 'pl-d5' }, { cls: 'pl-d6' },
        { cls: 'pl-d7' }, { cls: 'pl-d8' },
    ];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="app-preloader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1] }}
                >
                    {/* Three.js 3D canvas */}
                    <div className="preloader-canvas-wrap">
                        <Canvas
                            camera={{ position: [0, 0, 7], fov: 55 }}
                            dpr={[1, 1.5]}
                            gl={{ antialias: true, alpha: true }}
                        >
                            <Suspense fallback={null}>
                                <Scene />
                            </Suspense>
                        </Canvas>
                    </div>

                    {/* CSS doodle decorations */}
                    <div className="preloader-doodles" aria-hidden="true">
                        {doodles.map((d, i) => <div key={i} className={`pl-doodle ${d.cls}`} />)}
                    </div>

                    {/* Content card */}
                    <motion.div
                        className="preloader-content"
                        initial={{ opacity: 0, y: 28, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.96 }}
                        transition={{ duration: 0.6, ease: [0.34, 1.1, 0.64, 1], delay: 0.08 }}
                    >
                        {/* Circular sketch-ring progress */}
                        <div className="preloader-ring-wrap">
                            <svg className="preloader-ring-svg" viewBox="0 0 160 160" fill="none">
                                <defs>
                                    <linearGradient id="plGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#d44332" />
                                        <stop offset="55%" stopColor="#ff7a6b" />
                                        <stop offset="100%" stopColor="#3b5999" />
                                    </linearGradient>
                                    <filter id="plGlow">
                                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                {/* Outer doodle dashed ring */}
                                <circle cx="80" cy="80" r={R + 12}
                                    stroke="rgba(212,67,50,0.08)" strokeWidth="10"
                                    strokeDasharray="11 7" />
                                {/* Middle dashed ring */}
                                <circle cx="80" cy="80" r={R - 16}
                                    stroke="rgba(59,89,153,0.07)" strokeWidth="1.5"
                                    strokeDasharray="5 5" strokeDashoffset="8" />
                                {/* Track */}
                                <circle cx="80" cy="80" r={R}
                                    stroke="rgba(0,0,0,0.07)" strokeWidth="7" />
                                {/* Progress arc */}
                                <circle cx="80" cy="80" r={R}
                                    stroke="url(#plGrad)" strokeWidth="7"
                                    strokeLinecap="round"
                                    strokeDasharray={circ}
                                    strokeDashoffset={dashOffset}
                                    transform="rotate(-90 80 80)"
                                    filter="url(#plGlow)"
                                    style={{ transition: 'stroke-dashoffset 0.13s linear' }}
                                />
                            </svg>
                            <div className="preloader-ring-center">
                                <span className="preloader-pct">
                                    {progress}
                                    <span className="preloader-pct-sign">%</span>
                                </span>
                            </div>
                        </div>

                        {/* Brand name */}
                        <div className="preloader-brand">
                            <h1 className="preloader-title">
                                <motion.span
                                    className="brand-student"
                                    initial={{ opacity: 0, x: -18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.22, duration: 0.5 }}
                                >
                                    Student
                                </motion.span>
                                <motion.span
                                    className="brand-connect"
                                    initial={{ opacity: 0, x: 18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.38, duration: 0.5 }}
                                >
                                    Connect
                                </motion.span>
                            </h1>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={msgIdx}
                                    className="preloader-msg"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.28 }}
                                >
                                    {MESSAGES[msgIdx]}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        {/* Thin progress bar */}
                        <div className="preloader-bar-track">
                            <motion.div
                                className="preloader-bar-fill"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.12, ease: 'linear' }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
