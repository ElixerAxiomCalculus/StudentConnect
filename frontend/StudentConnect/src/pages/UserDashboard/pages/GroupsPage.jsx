import React, { useState } from 'react';
import { Users, Sparkles, Mail } from 'lucide-react';
import FrostCard from '../components/FrostCard';
import { useToast } from '../components/Toast';
import { groups } from '../data/mockData';

export default function GroupsPage() {
    const [requested, setRequested] = useState(false);
    const addToast = useToast();

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Groups</h1>
                <p className="page-subtitle">Connect with communities that share your interests</p>
            </div>

            <FrostCard flat>
                <div className="coming-soon-hero">
                    <div className="coming-soon-icon">
                        <Users size={36} />
                    </div>
                    <h2 className="coming-soon-title">Coming Soon</h2>
                    <p className="coming-soon-desc">
                        We're building something amazing! Groups will let you create and join communities
                        around shared interests, courses, and projects. Stay tuned!
                    </p>
                    <button
                        className={`btn ${requested ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => {
                            setRequested(true);
                            addToast?.("You'll be notified when Groups launches!", 'success');
                        }}
                        disabled={requested}
                    >
                        {requested ? (
                            <><Sparkles size={16} /> Request Submitted!</>
                        ) : (
                            <><Mail size={16} /> Request Early Access</>
                        )}
                    </button>

                    {/* Invited groups preview */}
                    <div className="invited-groups">
                        <h3 className="section-title" style={{ textAlign: 'left' }}>Your Invitations</h3>
                        {groups.filter(g => g.invited).map((group) => (
                            <div key={group.id} className="invited-group-item">
                                <div>
                                    <div className="invited-group-name">{group.name}</div>
                                    <div className="invited-group-members">{group.members} members</div>
                                </div>
                                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>Invited</span>
                            </div>
                        ))}
                        {groups.filter(g => !g.invited).map((group) => (
                            <div key={group.id} className="invited-group-item" style={{ opacity: 0.6 }}>
                                <div>
                                    <div className="invited-group-name">{group.name}</div>
                                    <div className="invited-group-members">{group.members} members</div>
                                </div>
                                <span className="badge badge-outline badge-outline-info" style={{ fontSize: '0.68rem' }}>Discover</span>
                            </div>
                        ))}
                    </div>
                </div>
            </FrostCard>
        </div>
    );
}
