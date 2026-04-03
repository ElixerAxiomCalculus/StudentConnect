import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="lp-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <h3><span className="brand-red">Student</span><span className="brand-blue">Connect</span></h3>
            <p>Building meaningful campus connections through intelligent matching.</p>
          </div>

          <div className="footer-links-group">
            <h4>Product</h4>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
            <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>How It Works</button>
            <button onClick={() => navigate('/auth')}>Sign Up</button>
          </div>

          <div className="footer-links-group">
            <h4>Company</h4>
            <button onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}>Mission</button>
            <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Contact</button>
          </div>

          <div className="footer-links-group">
            <h4>Get Started</h4>
            <button className="footer-cta" onClick={() => navigate('/auth')}>
              Join Free →
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 StudentConnect. Built with ❤️ for students everywhere.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;