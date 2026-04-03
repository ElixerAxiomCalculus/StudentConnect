import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, GraduationCap } from 'lucide-react';
import './AuthPage.css';

// Reusing Doodles from Landing Page
const DoodleArrow = () => (
    <svg className="auth-doodle auth-doodle-arrow" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,90 Q40,10 90,20 M70,10 L90,20 L80,40" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DoodleStar = () => (
    <svg className="auth-doodle auth-doodle-star" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25,5 L30,20 L45,25 L30,30 L25,45 L20,30 L5,25 L20,20 Z" stroke="#ffd166" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DoodleSwirl = () => (
    <svg className="auth-doodle auth-doodle-swirl" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5,25 Q25,-10 50,25 T95,25" stroke="#ff9f1c" strokeWidth="4" strokeLinecap="round" />
    </svg>
);

export default function AuthPage() {
    const { signup, login, verifyOtp, resendOtp, user } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'otp'
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [pendingEmail, setPendingEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const otpRefs = useRef([]);

    // If already logged in, redirect
    useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const data = await signup(form.name, form.email, form.password);
            setPendingEmail(form.email);
            setMode('otp');
            setSuccess(data.message || 'Check your email for the OTP.');
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const data = await login(form.email, form.password);
            if (data.requires_verification) {
                setPendingEmail(form.email);
                setMode('otp');
                setSuccess(data.message || 'Please verify your email.');
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otpDigits];
        next[index] = value.slice(-1);
        setOtpDigits(next);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtpDigits(pasted.split(''));
            otpRefs.current[5]?.focus();
            e.preventDefault();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otp = otpDigits.join('');
        if (otp.length < 6) { setError('Please enter the full 6-digit code'); return; }
        setError(''); setLoading(true);
        try {
            await verifyOtp(pendingEmail, otp);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleResend = async () => {
        setError(''); setLoading(true);
        try {
            const data = await resendOtp(pendingEmail);
            setSuccess(data.message || 'OTP resent!');
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-split-layout">
            {/* Left Side: Showcase */}
            <div className="auth-showcase">
                <div className="auth-showcase-content">
                    <button className="auth-home-btn" onClick={() => navigate('/')}>
                        ← Back to Home
                    </button>
                    <h2 className="showcase-title">
                        Connect.<br />Collaborate.<br />Succeed.
                    </h2>
                    <p className="showcase-subtitle">
                        Join the smartest network of students accelerating their academic and professional careers.
                    </p>

                    {/* Floating Doodles */}
                    <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="auth-doodle-pos pos-1">
                        <DoodleArrow />
                    </motion.div>
                    <motion.div animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }} className="auth-doodle-pos pos-2">
                        <DoodleStar />
                    </motion.div>
                    <motion.div animate={{ x: [0, 15, 0], rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="auth-doodle-pos pos-3">
                        <DoodleSwirl />
                    </motion.div>

                    {/* Floating Badges */}
                    <motion.div
                        className="showcase-badge sb-1"
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                    >
                        <div className="sb-icon"><GraduationCap size={20} /></div>
                        <div>
                            <strong>94% Match</strong>
                            <span>Study partners found</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Form Panel */}
            <div className="auth-panel">
                <div className="auth-card">
                    <div className="auth-brand">
                        <h1><span className="brand-student">Student</span><span className="brand-connect">Connect</span></h1>
                        <p className="brand-tagline">Welcome back to your dashboard</p>
                    </div>

                    {mode !== 'otp' && (
                        <div className="auth-tabs">
                            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} type="button" onClick={() => { setMode('login'); setError(''); }}>Log In</button>
                            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} type="button" onClick={() => { setMode('signup'); setError(''); }}>Sign Up</button>
                        </div>
                    )}

                    {error && <div className="auth-error">{error}</div>}
                    {success && !error && <div className="auth-success">{success}</div>}

                    {mode === 'signup' && (
                        <form onSubmit={handleSignup} className="auth-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required autoComplete="name" />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@university.edu" required autoComplete="email" />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required minLength={6} autoComplete="new-password" />
                            </div>
                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? <span className="auth-spinner" /> : 'Create Account'}
                            </button>
                        </form>
                    )}

                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="auth-form">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@university.edu" required autoComplete="email" />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required autoComplete="current-password" />
                            </div>
                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? <span className="auth-spinner" /> : 'Log In'}
                            </button>
                        </form>
                    )}

                    {mode === 'otp' && (
                        <form onSubmit={handleVerify} className="auth-form otp-form">
                            <div className="otp-icon-wrapper">
                                <Mail size={32} color="#d44332" />
                            </div>
                            <h2 className="otp-title">Verify Your Email</h2>
                            <p className="otp-subtitle">We sent a 6-digit code to <strong>{pendingEmail}</strong></p>

                            <div className="otp-inputs" onPaste={handleOtpPaste}>
                                {otpDigits.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={el => otpRefs.current[i] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={d}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                        className="otp-digit"
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            <button type="submit" className="auth-submit" disabled={loading}>
                                {loading ? <span className="auth-spinner" /> : 'Verify & Continue'}
                            </button>

                            <button type="button" className="auth-link" onClick={handleResend} disabled={loading}>
                                Didn't receive the code? <strong>Resend</strong>
                            </button>
                            <button type="button" className="auth-link" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                                ← Back to Login
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
