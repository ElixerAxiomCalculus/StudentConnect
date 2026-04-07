import React, { useState, useEffect } from 'react';

const TOUR_KEY = 'sc_tour_done';

const STEPS = [
    {
        icon: '👋',
        title: 'Welcome to StudentConnect!',
        desc: "You've set up your profile — your personalized dashboard is ready. Let's take a quick tour of what you can do here.",
        highlight: null,
        tip: null,
    },
    {
        icon: '🤝',
        title: 'Smart Teammate Matching',
        desc: "Your personality and preference data is already powering our algorithm. Check the Home page to see your match recommendations — swipe, like, and connect with students who complement your style.",
        highlight: 'home',
        tip: 'Tip: The more you interact, the better your matches get.',
    },
    {
        icon: '💬',
        title: 'Real-Time Chat',
        desc: "Once matched, you can message teammates directly. The Chat page supports threads, file attachments, and even group project chats — all in real time via WebSocket.",
        highlight: 'chat',
        tip: 'Tip: Pin important conversations so they stay at the top.',
    },
    {
        icon: '📁',
        title: 'Projects & Task Boards',
        desc: "Create collaborative projects, invite teammates, and manage tasks on a kanban board (To Do → In Progress → Done). Share a project ID to let anyone request to join.",
        highlight: 'projects',
        tip: 'Tip: Set deadlines on tasks so your team stays on track.',
    },
    {
        icon: '💬',
        title: 'Forums & Groups',
        desc: "Post discussions, ask for help, share project showcases in Forums. Join or create study groups, clubs, or project teams in Groups — with built-in group chat.",
        highlight: 'forums',
        tip: 'Tip: Bookmark useful threads so you can find them later.',
    },
    {
        icon: '⚙️',
        title: 'You can always update your profile',
        desc: "Head to Settings anytime to update your avatar, skills, goals, availability, and match preferences. The more up-to-date your profile, the better your recommendations.",
        highlight: 'settings',
        tip: null,
    },
];

export default function DashboardOnboarding() {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const done = localStorage.getItem(TOUR_KEY);
        if (!done) {
            // Slight delay so the dashboard has time to render first
            const t = setTimeout(() => setVisible(true), 600);
            return () => clearTimeout(t);
        }
    }, []);

    const close = () => {
        setExiting(true);
        setTimeout(() => {
            setVisible(false);
            localStorage.setItem(TOUR_KEY, '1');
        }, 300);
    };

    const next = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            close();
        }
    };

    const prev = () => {
        if (step > 0) setStep(s => s - 1);
    };

    if (!visible) return null;

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <>
            <style>{`
                .dot-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(10, 10, 20, 0.62);
                    backdrop-filter: blur(3px);
                    -webkit-backdrop-filter: blur(3px);
                    z-index: 9000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: dotFadeIn 0.3s ease both;
                }
                .dot-overlay.exiting { animation: dotFadeOut 0.3s ease both; }
                @keyframes dotFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes dotFadeOut { from { opacity: 1; } to { opacity: 0; } }

                .dot-modal {
                    background: rgba(255,255,255,0.97);
                    border-radius: 24px;
                    padding: 36px 40px;
                    max-width: 480px;
                    width: 100%;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.22);
                    position: relative;
                    animation: dotSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }
                @keyframes dotSlideUp {
                    from { transform: translateY(28px) scale(0.96); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }

                .dot-close {
                    position: absolute;
                    top: 14px; right: 16px;
                    width: 30px; height: 30px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(0,0,0,0.07);
                    color: #555566;
                    cursor: pointer;
                    font-size: 16px;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.18s;
                }
                .dot-close:hover { background: rgba(212,67,50,0.12); color: #d44332; }

                .dot-icon { font-size: 52px; display: block; text-align: center; margin-bottom: 16px; }
                .dot-title { font-size: 20px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px; text-align: center; }
                .dot-desc { font-size: 13.5px; color: #555566; line-height: 1.7; text-align: center; margin-bottom: 16px; }
                .dot-tip {
                    background: rgba(212,67,50,0.08);
                    border-left: 3px solid #d44332;
                    border-radius: 0 8px 8px 0;
                    padding: 9px 12px;
                    font-size: 12px;
                    color: #b83325;
                    font-weight: 500;
                    margin-bottom: 20px;
                }

                .dot-progress {
                    display: flex;
                    gap: 6px;
                    justify-content: center;
                    margin-bottom: 22px;
                }
                .dot-pip {
                    width: 8px; height: 8px; border-radius: 50%;
                    background: rgba(212,67,50,0.18);
                    transition: all 0.25s;
                }
                .dot-pip.active {
                    background: #d44332;
                    width: 20px;
                    border-radius: 4px;
                }

                .dot-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                .dot-btn-skip {
                    flex: 1;
                    padding: 11px;
                    border-radius: 10px;
                    border: 1.5px solid rgba(212,67,50,0.2);
                    background: transparent;
                    color: #8888a0;
                    font-size: 13.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.18s;
                }
                .dot-btn-skip:hover { border-color: #d44332; color: #d44332; }
                .dot-btn-back {
                    padding: 11px 18px;
                    border-radius: 10px;
                    border: 1.5px solid rgba(0,0,0,0.1);
                    background: transparent;
                    color: #555566;
                    font-size: 13.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.18s;
                    opacity: ${step === 0 ? 0.3 : 1};
                    pointer-events: ${step === 0 ? 'none' : 'auto'};
                }
                .dot-btn-back:hover { color: #1a1a2e; }
                .dot-btn-next {
                    flex: 2;
                    padding: 12px 22px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #e87748, #b83325);
                    color: white;
                    border: none;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(184,51,37,0.28);
                    transition: all 0.18s;
                }
                .dot-btn-next:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(184,51,37,0.36); }

                .dot-step-count {
                    text-align: center;
                    font-size: 11px;
                    color: #8888a0;
                    margin-bottom: 14px;
                }
                .dot-step-count b { color: #d44332; }
            `}</style>

            <div className={`dot-overlay${exiting ? ' exiting' : ''}`} onClick={e => { if (e.target === e.currentTarget) close(); }}>
                <div className="dot-modal">
                    <button className="dot-close" onClick={close} aria-label="Close tour">✕</button>

                    <span className="dot-icon">{current.icon}</span>
                    <h2 className="dot-title">{current.title}</h2>
                    <p className="dot-desc">{current.desc}</p>

                    {current.tip && (
                        <div className="dot-tip">💡 {current.tip}</div>
                    )}

                    <div className="dot-progress">
                        {STEPS.map((_, i) => (
                            <div key={i} className={`dot-pip${step === i ? ' active' : ''}`} onClick={() => setStep(i)} style={{ cursor: 'pointer' }} />
                        ))}
                    </div>

                    <div className="dot-step-count">
                        Step <b>{step + 1}</b> of {STEPS.length}
                    </div>

                    <div className="dot-actions">
                        {step === 0 ? (
                            <button className="dot-btn-skip" onClick={close}>Skip tour</button>
                        ) : (
                            <button className="dot-btn-back" onClick={prev}>← Back</button>
                        )}
                        <button className="dot-btn-next" onClick={next}>
                            {isLast ? '🚀 Let\'s go!' : 'Next →'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
