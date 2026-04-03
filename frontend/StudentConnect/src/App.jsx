import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalInteractions from './components/GlobalInteractions';
import AppPreloader from './components/AppPreloader';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './pages/UserDashboard/DashboardLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null; // AuthContext is still checking JWT
    if (!user) return <Navigate to="/auth" replace />;
    return children;
}

function AppRoutes() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <>
            <GlobalInteractions />
            {isLoading ? <AppPreloader onComplete={() => setIsLoading(false)} /> : null}

            <div className={`app-shell${isLoading ? ' app-shell--hidden' : ''}`}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
