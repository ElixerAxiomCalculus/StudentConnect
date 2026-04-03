import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Zap, MessageCircle, RotateCcw, Sparkles } from 'lucide-react';
import Avatar from './Avatar';

const matchProfiles = [
    { id: 'mp1', name: 'Ananya S', year: '3rd Year', major: 'Computer Science', tags: ['AI', 'Python', 'Research'], bio: 'Passionate about deep learning and NLP. Looking for research collaborators!', avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Ananya', interest: 92 },
    { id: 'mp2', name: 'Rohan M', year: '2nd Year', major: 'Electrical Engineering', tags: ['IoT', 'Robotics', 'Arduino'], bio: 'Building smart campus solutions. Love hackathons and late-night coding sessions.', avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Rohan', interest: 85 },
    { id: 'mp3', name: 'Kavya P', year: '4th Year', major: 'Data Science', tags: ['ML', 'Statistics', 'Kaggle'], bio: 'Kaggle expert. Interested in real-world ML applications and data storytelling.', avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Kavya', interest: 88 },
    { id: 'mp4', name: 'Arjun D', year: '1st Year', major: 'Mathematics', tags: ['Coding', 'Debate', 'Philosophy'], bio: 'Math nerd who also loves debate club. Always up for intellectual conversations.', avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Arjun', interest: 79 },
    { id: 'mp5', name: 'Meera K', year: '3rd Year', major: 'Design', tags: ['UI/UX', 'Figma', 'Web Dev'], bio: 'Designer who codes. Obsessed with beautiful interfaces and micro-interactions.', avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Meera', interest: 94 },
    { id: 'mp6', name: 'Vikash R', year: '2nd Year', major: 'Physics', tags: ['Quantum', 'Simulation', 'MATLAB'], bio: 'Exploring quantum computing one qubit at a time. Looking for study partners.', avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Vikash', interest: 81 },
    { id: 'mp7', name: 'Shreya T', year: '2nd Year', major: 'Biotechnology', tags: ['Genomics', 'Lab', 'Python'], bio: 'Combining biology and data science to solve real-world health problems.', avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Shreya', interest: 76 },
    { id: 'mp8', name: 'Dev P', year: '3rd Year', major: 'Civil Engineering', tags: ['Sustainability', 'CAD', 'Urban'], bio: 'Designing smart cities of tomorrow. Looking for creative minds to collaborate.', avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Dev', interest: 83 },
];

export default function LiveMode({ onClose }) {
    const [deck, setDeck] = useState([...matchProfiles]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [swipeDir, setSwipeDir] = useState(null);
    const [showMatch, setShowMatch] = useState(null);
    const [exiting, setExiting] = useState(false);
    const cardRef = useRef(null);
    const startPos = useRef({ x: 0, y: 0 });

    const currentCard = deck[currentIndex];
    const nextCard = deck[currentIndex + 1];

    const threshold = 120;

    // Mouse/Touch handlers
    const handleStart = useCallback((clientX, clientY) => {
        setIsDragging(true);
        startPos.current = { x: clientX, y: clientY };
    }, []);

    const handleMove = useCallback((clientX, clientY) => {
        if (!isDragging) return;
        const dx = clientX - startPos.current.x;
        const dy = clientY - startPos.current.y;
        setDragOffset({ x: dx, y: dy });
        if (dx > 40) setSwipeDir('right');
        else if (dx < -40) setSwipeDir('left');
        else setSwipeDir(null);
    }, [isDragging]);

    const handleEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        if (Math.abs(dragOffset.x) > threshold) {
            completeSwipe(dragOffset.x > 0 ? 'right' : 'left');
        } else {
            setDragOffset({ x: 0, y: 0 });
            setSwipeDir(null);
        }
    }, [isDragging, dragOffset]);

    const completeSwipe = (direction) => {
        const endX = direction === 'right' ? 600 : -600;
        setDragOffset({ x: endX, y: dragOffset.y });
        setSwipeDir(direction);

        setTimeout(() => {
            if (direction === 'right' && currentCard && Math.random() > 0.5) {
                setShowMatch(currentCard);
            }
            setCurrentIndex(prev => prev + 1);
            setDragOffset({ x: 0, y: 0 });
            setSwipeDir(null);
        }, 300);
    };

    const handleLike = () => completeSwipe('right');
    const handlePass = () => completeSwipe('left');

    const handleClose = () => {
        setExiting(true);
        setTimeout(onClose, 500);
    };

    const resetDeck = () => {
        setCurrentIndex(0);
        setDeck([...matchProfiles]);
    };

    // Mouse events
    const onMouseDown = (e) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();

    // Touch events
    const onTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEnd = () => handleEnd();

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging, onMouseMove, onMouseUp]);

    const rotation = dragOffset.x * 0.08;
    const opacity = Math.max(0, 1 - Math.abs(dragOffset.x) / 400);

    return (
        <div className={`live-overlay ${exiting ? 'exiting' : ''}`}>
            {/* Background */}
            <div className="live-bg" />

            {/* Close */}
            <button className="live-close-btn" onClick={handleClose}>
                <X size={22} />
            </button>

            {/* Header */}
            <div className="live-header">
                <div className="live-header-icon"><Zap size={22} /></div>
                <h2 className="live-title">Live Match Mode</h2>
                <p className="live-subtitle">Discover and connect with students instantly</p>
                {currentIndex < deck.length && (
                    <p className="live-counter">{currentIndex + 1} / {deck.length}</p>
                )}
            </div>

            {/* Card Stack */}
            <div className="live-card-area">
                {currentIndex < deck.length ? (
                    <>
                        {/* Next card (behind) */}
                        {nextCard && (
                            <div className="live-card live-card-behind">
                                <div className="live-card-img" style={{ backgroundImage: `url(${nextCard.avatar})` }} />
                                <div className="live-card-gradient" />
                                <div className="live-card-info">
                                    <h3>{nextCard.name}</h3>
                                    <span>{nextCard.year} · {nextCard.major}</span>
                                </div>
                            </div>
                        )}

                        {/* Current swiping card */}
                        <div
                            ref={cardRef}
                            className={`live-card live-card-active ${swipeDir === 'right' ? 'swipe-right' : swipeDir === 'left' ? 'swipe-left' : ''}`}
                            style={{
                                transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.3}px) rotate(${rotation}deg)`,
                                transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
                                opacity: Math.abs(dragOffset.x) > 300 ? opacity : 1,
                            }}
                            onMouseDown={onMouseDown}
                            onTouchStart={onTouchStart}
                        >
                            {/* Swipe overlays */}
                            <div className="live-swipe-overlay like" style={{ opacity: Math.max(0, dragOffset.x / threshold * 0.8) }}>
                                <Heart size={50} />
                                <span>CONNECT</span>
                            </div>
                            <div className="live-swipe-overlay pass" style={{ opacity: Math.max(0, -dragOffset.x / threshold * 0.8) }}>
                                <X size={50} />
                                <span>PASS</span>
                            </div>

                            <div className="live-card-img" style={{ backgroundImage: `url(${currentCard.avatar})` }} />
                            <div className="live-card-gradient" />
                            <div className="live-card-info">
                                <h3>{currentCard.name}</h3>
                                <span className="live-card-year">{currentCard.year} · {currentCard.major}</span>
                                <p className="live-card-bio">{currentCard.bio}</p>
                                <div className="live-card-tags">
                                    {currentCard.tags.map(tag => (
                                        <span key={tag} className="live-tag">{tag}</span>
                                    ))}
                                </div>
                                <div className="live-interest-bar">
                                    <span className="live-interest-label"><Sparkles size={11} /> {currentCard.interest}% match</span>
                                    <div className="live-interest-track">
                                        <div className="live-interest-fill" style={{ width: `${currentCard.interest}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="live-actions">
                            <button className="live-action-btn pass" onClick={handlePass}>
                                <X size={24} />
                            </button>
                            <button className="live-action-btn super" onClick={handleLike}>
                                <Zap size={22} />
                            </button>
                            <button className="live-action-btn like" onClick={handleLike}>
                                <Heart size={24} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="live-empty">
                        <Sparkles size={40} />
                        <h3>You've seen everyone!</h3>
                        <p>Check back later for new students</p>
                        <button className="btn btn-primary" onClick={resetDeck}>
                            <RotateCcw size={15} /> Start Over
                        </button>
                    </div>
                )}
            </div>

            {/* Match Popup */}
            <AnimatePresence>
                {showMatch && (
                    <motion.div
                        className="live-match-overlay"
                        onClick={() => setShowMatch(null)}
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(12px)', background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.4 }}
                    >
                        <motion.div
                            className="live-match-popup"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.3, y: 100, opacity: 0, rotate: -5 }}
                            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.8, y: 50, opacity: 0, rotate: 5 }}
                            transition={{ type: "spring", damping: 15, stiffness: 150 }}
                        >
                            <motion.div
                                className="live-match-sparkle"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring" }}
                            >✨</motion.div>
                            <h2 className="live-match-title">It's a Match!</h2>
                            <p className="live-match-sub">You and <strong>{showMatch.name}</strong> want to connect</p>
                            <div className="live-match-avatars">
                                <motion.img
                                    initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1, type: "spring" }}
                                    src={'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Me'} alt="You" className="live-match-avatar"
                                />
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                                    className="live-match-heart"
                                >
                                    <Heart size={20} fill="#d44332" />
                                </motion.div>
                                <motion.img
                                    initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1, type: "spring" }}
                                    src={showMatch.avatar} alt={showMatch.name} className="live-match-avatar"
                                />
                            </div>
                            <div className="live-match-actions">
                                <button className="btn btn-primary" onClick={() => setShowMatch(null)}>
                                    <MessageCircle size={15} /> Start Chat
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowMatch(null)}>
                                    Continue Swiping
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
