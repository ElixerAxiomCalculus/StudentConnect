import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const AuthContext = createContext(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

async function authRequest(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('sc_token'));
    const [loading, setLoading] = useState(true);

    // Restore session on mount / reload
    useEffect(() => {
        if (!token) { setLoading(false); return; }

        fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(u => { setUser(u); })
            .catch(() => { localStorage.removeItem('sc_token'); setToken(null); })
            .finally(() => setLoading(false));
    }, [token]);

    const saveSession = useCallback((data) => {
        localStorage.setItem('sc_token', data.token);
        setToken(data.token);
        setUser(data.user);
    }, []);

    const signup = useCallback(async (name, email, password) => {
        return authRequest('/api/auth/register', { name, email, password });
    }, []);

    const verifyOtp = useCallback(async (email, otp) => {
        const data = await authRequest('/api/auth/verify-email', { email, otp });
        saveSession(data);
        return data;
    }, [saveSession]);

    const resendOtp = useCallback(async (email) => {
        return authRequest('/api/auth/resend-otp', { email });
    }, []);

    const login = useCallback(async (email, password) => {
        const data = await authRequest('/api/auth/login', { email, password });
        if (data.requires_verification) return data;
        saveSession(data);
        return data;
    }, [saveSession]);

    const logout = useCallback(() => {
        localStorage.removeItem('sc_token');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, signup, verifyOtp, resendOtp, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
