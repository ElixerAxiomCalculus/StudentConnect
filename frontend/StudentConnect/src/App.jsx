import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import StaggeredMenu from './components/StaggeredMenu';
import DashboardLayout from './pages/UserDashboard/DashboardLayout';
import ThreeBackground from './components/ThreeBackground';
import GlobalInteractions from './components/GlobalInteractions';
import AppPreloader from './components/AppPreloader';
import './App.css';

function LandingPage() {
    const menuItems = [
        { label: 'Home', link: '#hero', ariaLabel: 'Navigate to Home' },
        { label: 'Mission', link: '#mission', ariaLabel: 'Navigate to Mission' },
        { label: 'About', link: '#about', ariaLabel: 'Navigate to About' },
        { label: 'Features', link: '#features', ariaLabel: 'Navigate to Features' },
        { label: 'Contact Us', link: '#contact', ariaLabel: 'Navigate to Contact Us' },
    ];

    const socialItems = [
        { label: 'GitHub', link: 'https://github.com' },
    ];

    return (
        <>
            <StaggeredMenu
                position="right"
                colors={['#d44332', '#3b5999']}
                items={menuItems}
                socialItems={socialItems}
                displaySocials={true}
                displayItemNumbering={true}
                logoUrl={null}
                isFixed={true}
                menuButtonColor="#000"
                openMenuButtonColor="#fff"
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>StudentConnect</h1>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>Connect, collaborate, and grow together.</p>
                <a href="/dashboard" style={{
                    padding: '12px 32px',
                    background: '#d44332',
                    color: 'white',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    transition: 'transform 0.2s ease',
                }}>
                    Open Dashboard →
                </a>
            </div>
        </>
    );
}

function App() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <>
            <ThreeBackground />
            <GlobalInteractions />

            {isLoading && <AppPreloader onComplete={() => setIsLoading(false)} />}

            {/* Render app in background but hide until load completes */}
            <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease-in' }}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard/*" element={<DashboardLayout />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
