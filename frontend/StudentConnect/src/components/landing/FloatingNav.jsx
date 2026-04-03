import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingNav.css';

const FloatingNav = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    if (window.lenis) {
      window.lenis.scrollTo(`#${id}`, { offset: 0 });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`floating-nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="brand-red">Student</span><span className="brand-blue">Connect</span>
      </div>

      <div className="nav-links">
        <button onClick={() => scrollTo('mission')}>Mission</button>
        <button onClick={() => scrollTo('features')}>Features</button>
        <button onClick={() => scrollTo('about')}>About</button>
        <button onClick={() => scrollTo('contact')}>Contact</button>
      </div>

      <div className="nav-actions">
        <button className="nav-login" onClick={() => navigate('/auth')}>Log In</button>
        <button className="nav-signup" onClick={() => navigate('/auth')}>Sign Up →</button>
      </div>
    </nav>
  );
};

export default FloatingNav;