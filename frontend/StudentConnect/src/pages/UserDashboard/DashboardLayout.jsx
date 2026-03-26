import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import QuickAccessToolbar from './components/QuickAccessToolbar';
import { ToastProvider } from './components/Toast';
import AnimatedPage from './components/AnimatedPage';
import './dashboard.css';

// Lazy load heavy pages for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ForumsPage = lazy(() => import('./pages/ForumsPage'));
const GroupsPage = lazy(() => import('./pages/GroupsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LogOutPage = lazy(() => import('./pages/LogOutPage'));

function PageLoader() {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 300, color: 'var(--text-muted)', fontSize: '0.9rem',
        }}>
            <div style={{
                width: 32, height: 32, border: '3px solid rgba(0,0,0,0.06)',
                borderTopColor: 'var(--accent-3)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function DashboardLayout() {
    const location = useLocation();

    return (
        <ToastProvider>
            <div className="dashboard-bg" />
            <div className="dashboard-shell">
                <Sidebar />
                <main className="main-panel">
                    <div className="main-content frost-panel">
                        <Suspense fallback={<PageLoader />}>
                            <AnimatePresence mode="wait">
                                <Routes location={location} key={location.pathname}>
                                    <Route index element={<AnimatedPage><HomePage /></AnimatedPage>} />
                                    <Route path="chat" element={<AnimatedPage><ChatPage /></AnimatedPage>} />
                                    <Route path="projects" element={<AnimatedPage><ProjectsPage /></AnimatedPage>} />
                                    <Route path="forums" element={<AnimatedPage><ForumsPage /></AnimatedPage>} />
                                    <Route path="groups" element={<AnimatedPage><GroupsPage /></AnimatedPage>} />
                                    <Route path="settings" element={<AnimatedPage><SettingsPage /></AnimatedPage>} />
                                    <Route path="logout" element={<AnimatedPage><LogOutPage /></AnimatedPage>} />
                                </Routes>
                            </AnimatePresence>
                        </Suspense>
                    </div>
                    <QuickAccessToolbar />
                </main>
            </div>
        </ToastProvider>
    );
}
