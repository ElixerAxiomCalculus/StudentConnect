import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { GraduationCap, MessageCircle } from 'lucide-react';
import './HeroSection.css';

const DoodleArrow = () => (
  <svg className="doodle doodle-arrow" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10,90 Q40,10 90,20 M70,10 L90,20 L80,40" stroke="#d44332" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoodleStar = () => (
  <svg className="doodle doodle-star" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25,5 L30,20 L45,25 L30,30 L25,45 L20,30 L5,25 L20,20 Z" stroke="#3d5999" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoodleSwirl = () => (
  <svg className="doodle doodle-swirl" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5,25 Q25,-10 50,25 T95,25" stroke="#ff7b6d" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const HeroSection = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-eyebrow', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.2 })
        .fromTo('.hero-title-line', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.15 }, '-=0.4')
        .fromTo('.hero-subtitle', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.4')
        .fromTo('.hero-buttons > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, clearProps: 'all' }, '-=0.3')
        .fromTo('.hero-visual-container', { y: 100, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out' }, '-=0.8')
        .fromTo('.hero-stats', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.5');

      // DrawSVG-like animation using stroke-dasharray
      gsap.fromTo('.doodle path',
        { strokeDasharray: 300, strokeDashoffset: 300 },
        { strokeDashoffset: 0, duration: 1.5, stagger: 0.2, ease: "power2.inOut", delay: 1 }
      );

      // Parallax on video container
      gsap.to('.hero-visual-container', {
        y: -80,
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 }
      });

      // Text scale parallax
      gsap.to('.hero-content', {
        y: -40, opacity: 0.5,
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-section" id="home" ref={heroRef}>

      {/* Background Doodles */}
      <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="doodle-wrapper doodle-pos-1">
        <DoodleArrow />
      </motion.div>
      <motion.div animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }} className="doodle-wrapper doodle-pos-2">
        <DoodleStar />
      </motion.div>
      <motion.div animate={{ x: [0, 15, 0], rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="doodle-wrapper doodle-pos-3">
        <DoodleSwirl />
      </motion.div>

      <div className="hero-content">
        <div className="hero-eyebrow"> Your campus network, reimagined</div>

        <h1 className="hero-title">
          <div className="hero-title-line">Find Your Perfect</div>
          <div className="hero-title-line"><span className="accent">Study</span> <span className="accent-blue">Match</span></div>
        </h1>

        <p className="hero-subtitle">
          Connect with peers who share your major, passions, and study habits.
          Because college is better when you build the right network.
        </p>

        <div className="hero-buttons">
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/auth')}>
            Get Started Free
          </button>
          <button className="lp-btn lp-btn--secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            See How It Works ↓
          </button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat"><strong>2,500+</strong><span>Active Students</span></div>
          <div className="hero-stat"><strong>94%</strong><span>Match Accuracy</span></div>
          <div className="hero-stat"><strong>180+</strong><span>Study Groups</span></div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-visual-container glass-card">
          <div className="browser-mockup">
            <div className="browser-dots">
              <span /> <span /> <span />
            </div>
            <div className="browser-url">studentconnect.io/dashboard</div>
          </div>
          <div className="hero-video-wrap">
            <video
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              src="/Untitled file.mp4"
            />
          </div>

          {/* Floating React Motion Divs */}
          <motion.div
            className="hero-floating-badge badge-1"
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <span className="badge-icon"><GraduationCap size={18} /></span>
            <span>Perfect Match!</span>
          </motion.div>
          <motion.div
            className="hero-floating-badge badge-2"
            animate={{ y: [10, -10, 10] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
          >
            <span className="badge-icon"><MessageCircle size={18} /></span>
            <span>New Message</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;