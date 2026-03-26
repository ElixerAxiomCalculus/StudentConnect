import React from 'react';
import './FloatingNav.css';

const FloatingNav = () => {
  return (
    <nav className="floating-nav">
      <div className="nav-logo">
        <span className="brand-text">STUDENT<strong>CONNECT</strong></span>
      </div>

      <div className="nav-links">
        <a href="#mission">Mission</a>
        <a href="#about">About</a>
        <a href="#features">Features</a>
        <a href="#contact">Contact</a>
      </div>

      <div className="nav-actions">
        <button className="login-btn">Log In</button>
        <button className="signup-btn">Sign Up</button>
      </div>
    </nav>
  );
};

export default FloatingNav;