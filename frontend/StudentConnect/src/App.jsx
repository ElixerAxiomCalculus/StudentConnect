import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalInteractions from './components/GlobalInteractions';
import AppPreloader from './components/AppPreloader';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './pages/UserDashboard/DashboardLayout';
import OnboardingQuestionnaire from './pages/Questionnaire/OnboardingQuestionnaire';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

/**
 * ProtectedRoute — requires authentication AND completed questionnaire.
 * If not logged in → /auth
 * If logged in but questionnaire not done → /questionnaire
 */
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/auth" replace />;
    if (user.questionnaire_completed === false) return <Navigate to="/questionnaire" replace />;
    return children;
}

/**
 * QuestionnaireRoute — requires authentication but questionnaire NOT yet done.
 * If not logged in → /auth
 * If already completed questionnaire → /dashboard
 */
function QuestionnaireRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/auth" replace />;
    if (user.questionnaire_completed !== false) return <Navigate to="/dashboard" replace />;
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
                        path="/questionnaire"
                        element={
                            <QuestionnaireRoute>
                                <OnboardingQuestionnaire />
                            </QuestionnaireRoute>
                        }
                    />
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
