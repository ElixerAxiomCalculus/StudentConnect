import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronDown, Sparkles, HelpCircle, BookOpen, Users, Zap, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
    {
        id: 'faq1',
        icon: '🔍',
        question: 'How does matching work?',
        answer: 'StudentConnect uses a smart algorithm that scores you against other students based on shared skills, interests, major, and year. The higher the % match, the more aligned your academic profiles are!',
    },
    {
        id: 'faq2',
        icon: '💬',
        question: 'How do I start a chat?',
        answer: 'Head to the Chat page from the sidebar. You can message any student you\'ve matched with. Use the search bar to find specific conversations.',
    },
    {
        id: 'faq3',
        icon: '📁',
        question: 'How do I create a project?',
        answer: 'Go to Projects → click "New Project". Fill in the title, description, required skills, and deadline. Your project will be visible to potential collaborators!',
    },
    {
        id: 'faq4',
        icon: '👥',
        question: 'What are Groups?',
        answer: 'Groups are communities organized by category (Study Groups, Hackathon Teams, Research, etc.). Join groups to collaborate with like-minded students and stay updated.',
    },
    {
        id: 'faq5',
        icon: '⚡',
        question: 'What is Live Match Mode?',
        answer: 'Live Mode is a swipe-based interface to quickly discover and connect with students. Swipe right (or tap the heart) to connect, swipe left to pass. It\'s like a faster way to browse matches!',
    },
    {
        id: 'faq6',
        icon: '🔔',
        question: 'How do I manage notifications?',
        answer: 'Go to Settings → Notifications. You can toggle email, push, and in-app notifications for matches, messages, forum replies, and more.',
    },
    {
        id: 'faq7',
        icon: '🎨',
        question: 'Can I change my avatar?',
        answer: 'Yes! Go to Settings → Profile → click "Change Avatar". Choose from 50 doodle-style characters to represent you across the platform.',
    },
    {
        id: 'faq8',
        icon: '🏆',
        question: 'How do I earn badges?',
        answer: 'Badges are earned by being active: posting in forums, joining projects, completing your profile, and making connections. Check your profile to see progress!',
    },
];

const QUICK_PROMPTS = [
    { label: 'Getting started', icon: <Sparkles size={13} />, message: 'How do I get started on StudentConnect?' },
    { label: 'Find matches', icon: <Users size={13} />, message: 'How does matching work?' },
    { label: 'Live Mode', icon: <Zap size={13} />, message: 'What is Live Match Mode?' },
    { label: 'Settings', icon: <Settings size={13} />, message: 'How do I update my profile?' },
];

function getBotReply(userMsg) {
    const msg = userMsg.toLowerCase();

    if (msg.includes('match') || msg.includes('connect') || msg.includes('find')) {
        return FAQS[0].answer;
    }
    if (msg.includes('chat') || msg.includes('message') || msg.includes('talk')) {
        return FAQS[1].answer;
    }
    if (msg.includes('project') || msg.includes('create') || msg.includes('new project')) {
        return FAQS[2].answer;
    }
    if (msg.includes('group') || msg.includes('community') || msg.includes('team')) {
        return FAQS[3].answer;
    }
    if (msg.includes('live') || msg.includes('swipe') || msg.includes('mode')) {
        return FAQS[4].answer;
    }
    if (msg.includes('notif') || msg.includes('alert') || msg.includes('email')) {
        return FAQS[5].answer;
    }
    if (msg.includes('avatar') || msg.includes('picture') || msg.includes('photo') || msg.includes('profile picture')) {
        return FAQS[6].answer;
    }
    if (msg.includes('badge') || msg.includes('achievement') || msg.includes('earn')) {
        return FAQS[7].answer;
    }
    if (msg.includes('get started') || msg.includes('how to') || msg.includes('begin') || msg.includes('start')) {
        return "Welcome to StudentConnect! 🎉 Start by completing your profile in Settings, then explore your Matches on the Home page. Use Live Mode for quick swipe-based matching, join Groups to find communities, and collaborate on Projects. Need help with anything specific?";
    }
    if (msg.includes('settings') || msg.includes('update') || msg.includes('change')) {
        return "Go to Settings from the sidebar. You can update your display name, bio, major, interests, and choose from 50 doodle avatars. Don't forget to hit Save!";
    }
    if (msg.includes('forum') || msg.includes('post') || msg.includes('discuss')) {
        return "Head to the Forums page to browse discussions by category. You can create a new thread with the '+ New Thread' button, vote on posts, and reply to comments. Filter by Latest, Most Popular, or Most Active!";
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "Hey there! 👋 I'm your StudentConnect assistant. Ask me anything about using the platform, or tap one of the FAQ topics below!";
    }
    if (msg.includes('help') || msg.includes('support')) {
        return "I'm here to help! You can ask me about matching, chats, projects, groups, Live Mode, notifications, or settings. Or tap one of the FAQ chips below for quick answers.";
    }

    return "I'm not sure about that one! Try asking about matching, chats, projects, groups, Live Mode, notifications, or settings. You can also browse the FAQ topics below. 🙂";
}

export default function HelpBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 'm0', from: 'bot', text: "Hi! 👋 I'm your StudentConnect assistant. Ask me anything or tap a FAQ to get started!", ts: Date.now() },
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [showFaqs, setShowFaqs] = useState(true);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [open, messages]);

    const sendMessage = (text) => {
        if (!text.trim()) return;
        const userMsg = { id: `m${Date.now()}`, from: 'user', text: text.trim(), ts: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setShowFaqs(false);
        setTyping(true);

        setTimeout(() => {
            const reply = getBotReply(text);
            setMessages(prev => [...prev, { id: `m${Date.now() + 1}`, from: 'bot', text: reply, ts: Date.now() }]);
            setTyping(false);
        }, 700 + Math.random() * 400);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleFaqClick = (faq) => {
        sendMessage(faq.question);
    };

    const handleQuickPrompt = (prompt) => {
        sendMessage(prompt.message);
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <motion.button
                className="helpbot-trigger"
                onClick={() => setOpen(v => !v)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                aria-label="Open help chatbot"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                            <ChevronDown size={22} />
                        </motion.span>
                    ) : (
                        <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                            <MessageCircle size={22} />
                        </motion.span>
                    )}
                </AnimatePresence>
                {!open && <span className="helpbot-trigger-pulse" />}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="helpbot-panel"
                        initial={{ opacity: 0, scale: 0.88, y: 24, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 24 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 240 }}
                    >
                        {/* Header */}
                        <div className="helpbot-header">
                            <div className="helpbot-header-avatar">
                                <Sparkles size={16} />
                            </div>
                            <div className="helpbot-header-info">
                                <span className="helpbot-header-name">StudentConnect Assistant</span>
                                <span className="helpbot-header-status">Always here to help</span>
                            </div>
                            <button className="helpbot-close-btn" onClick={() => setOpen(false)} aria-label="Close chatbot">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="helpbot-messages">
                            {messages.map(msg => (
                                <div key={msg.id} className={`helpbot-msg helpbot-msg--${msg.from}`}>
                                    {msg.from === 'bot' && (
                                        <div className="helpbot-bot-icon"><Sparkles size={11} /></div>
                                    )}
                                    <div className="helpbot-bubble">{msg.text}</div>
                                </div>
                            ))}

                            {typing && (
                                <div className="helpbot-msg helpbot-msg--bot">
                                    <div className="helpbot-bot-icon"><Sparkles size={11} /></div>
                                    <div className="helpbot-bubble helpbot-typing">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            )}

                            {/* FAQ chips */}
                            {showFaqs && !typing && (
                                <div className="helpbot-faqs">
                                    <span className="helpbot-faqs-label"><HelpCircle size={12} /> Frequently asked</span>
                                    <div className="helpbot-faq-grid">
                                        {FAQS.map(faq => (
                                            <button key={faq.id} className="helpbot-faq-chip" onClick={() => handleFaqClick(faq)}>
                                                <span>{faq.icon}</span> {faq.question}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        {/* Quick Prompts */}
                        <div className="helpbot-quick-bar">
                            {QUICK_PROMPTS.map(p => (
                                <button key={p.label} className="helpbot-quick-chip" onClick={() => handleQuickPrompt(p)}>
                                    {p.icon} {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="helpbot-input-row">
                            <textarea
                                ref={inputRef}
                                className="helpbot-input"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                rows={1}
                            />
                            <button
                                className="helpbot-send-btn"
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim()}
                                aria-label="Send message"
                            >
                                <Send size={15} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
