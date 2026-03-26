import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Zap, MessageSquare } from 'lucide-react';
import GlassSurface from './GlassSurface';
import LiveMode from './LiveMode';

export default function QuickAccessToolbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLiveMode, setShowLiveMode] = useState(false);
    const [activating, setActivating] = useState(false);

    const isChat = location.pathname.includes('/chat');
    const isForums = location.pathname.includes('/forums');

    const handleLiveMode = () => {
        setActivating(true);
        setTimeout(() => {
            setShowLiveMode(true);
            setActivating(false);
        }, 600);
    };

    const closeLiveMode = () => {
        setShowLiveMode(false);
    };

    return (
        <>
            {/* Activation blur overlay */}
            {activating && <div className="qat-activation-wave" />}

            {/* Live Mode Overlay */}
            {showLiveMode && <LiveMode onClose={closeLiveMode} />}

            {/* Toolbar */}
            <div className="qat-container">
                <GlassSurface
                    width="auto"
                    height={60}
                    borderRadius={30}
                    brightness={60}
                    opacity={0.95}
                    blur={14}
                    backgroundOpacity={0.15}
                    saturation={1.4}
                    className="qat-glass"
                >
                    <div className="qat-buttons">
                        {/* Chat Button */}
                        <button
                            className={`qat-btn ${isChat ? 'active' : ''}`}
                            onClick={() => navigate('/dashboard/chat')}
                            title="Chats"
                        >
                            <MessageCircle size={20} />
                            <span className="qat-tooltip">Chats</span>
                        </button>

                        {/* Live Mode CTA */}
                        <button
                            className="qat-btn qat-live-btn"
                            onClick={handleLiveMode}
                            title="Start Live Mode"
                        >
                            <Zap size={22} />
                            <span className="qat-pulse" />
                        </button>

                        {/* Forums Button */}
                        <button
                            className={`qat-btn ${isForums ? 'active' : ''}`}
                            onClick={() => navigate('/dashboard/forums')}
                            title="Forums"
                        >
                            <MessageSquare size={20} />
                            <span className="qat-tooltip">Forums</span>
                        </button>
                    </div>
                </GlassSurface>
            </div>
        </>
    );
}
