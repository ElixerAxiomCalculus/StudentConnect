import React from 'react';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function LogOutPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div>
            <div className="logout-prompt">
                <div className="logout-icon">
                    <LogOut size={30} />
                </div>
                <h2 className="logout-title">Sign Out?</h2>
                <p className="logout-desc">
                    You'll need to sign in again to access your dashboard, chats, and projects.
                </p>
                <div className="logout-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={16} /> Go Back
                    </button>
                    <button className="btn btn-primary" onClick={handleLogout} style={{ background: 'var(--danger)' }}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
