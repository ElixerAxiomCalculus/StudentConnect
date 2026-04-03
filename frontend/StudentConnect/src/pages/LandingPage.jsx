import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FloatingNav from '../components/landing/FloatingNav';
import HeroSection from '../components/landing/HeroSection';
import Mission from '../components/landing/Mission';
import Features from '../components/landing/Features';
import About from '../components/landing/About';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';
import LandingScene from '../components/landing/LandingScene';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);

  useEffect(() => {
    // Smooth scroll
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.lenis = lenis;
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);

    // Custom cursor
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    const moveCursor = (e) => {
      gsap.to(cursor, { x: e.clientX - 20, y: e.clientY - 20, duration: 0.5, ease: 'power2.out' });
      gsap.to(dot, { x: e.clientX - 4, y: e.clientY - 4, duration: 0.1 });
    };
    window.addEventListener('mousemove', moveCursor);

    // Hover scale effect on interactive elements
    const interactives = document.querySelectorAll('a, button, .feature-card, .stat-card');
    const grow = () => gsap.to(cursor, { scale: 1.8, duration: 0.3 });
    const shrink = () => gsap.to(cursor, { scale: 1, duration: 0.3 });
    interactives.forEach(el => { el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink); });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      interactives.forEach(el => { el.removeEventListener('mouseenter', grow); el.removeEventListener('mouseleave', shrink); });
      lenis.destroy();
      delete window.lenis;
    };
  }, []);

  // Global Background Color Transition setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = [
        { id: '#home', color: '#fff0ed', isDark: false, accentColor: '#d44332' },     // Hero -> Soft Cream/Orange, Red cursor
        { id: '#mission', color: '#1a1a2e', isDark: true, accentColor: '#00f2fe' },   // Mission -> Deep Navy, Cyan cursor
        { id: '#features', color: '#ffdc82', isDark: false, accentColor: '#1a1a2e' }, // Features -> Bright Yellow/Gold, Black cursor
        { id: '#about', color: '#A42C1F', isDark: true, accentColor: '#ffffff' },     // About -> Brand Red, White cursor
        { id: '#contact', color: '#e8ecf6', isDark: false, accentColor: '#d44332' },  // Contact -> Soft Blue, Red cursor
      ];

      sections.forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec.id,
          start: 'top 50%', // when section hits middle of screen
          end: 'bottom 50%',
          onEnter: () => updateTheme(sec),
          onEnterBack: () => updateTheme(sec),
        });
      });

      function updateTheme(sec) {
        gsap.to('.global-bg', { backgroundColor: sec.color, duration: 1.2, ease: 'power2.out' });

        if (sec.isDark) {
          document.body.classList.add('theme-dark');
        } else {
          document.body.classList.remove('theme-dark');
        }

        // Apply dynamic cursor color via GSAP directly
        if (cursorDotRef.current && cursorRef.current) {
          gsap.to(cursorDotRef.current, { backgroundColor: sec.accentColor, duration: 0.5 });
          const ring = cursorRef.current.querySelector('.cursor-ring');
          if (ring) {
            gsap.to(ring, { borderColor: sec.accentColor, duration: 0.5 });
          }
        }
      }

      // Initial state
      gsap.set('.global-bg', { backgroundColor: '#fff0ed' });
      document.body.classList.remove('theme-dark');
      if (cursorDotRef.current) gsap.set(cursorDotRef.current, { backgroundColor: '#d44332' });
      const initRing = cursorRef.current?.querySelector('.cursor-ring');
      if (initRing) gsap.set(initRing, { borderColor: '#d44332' });

    }, containerRef);
    return () => {
      ctx.revert();
      document.body.classList.remove('theme-dark');
    };
  }, []);

  return (
    <div className="landing-page" ref={containerRef}>
      {/* Custom Cursor */}
      <div ref={cursorRef} className="custom-cursor">
        <div className="cursor-ring" />
      </div>
      <div ref={cursorDotRef} className="custom-cursor-dot" />

      {/* Global Background Layer for colors */}
      <div className="global-bg" style={{ position: 'fixed', inset: 0, zIndex: -2 }} />

      {/* Animated gradient background (fallback/blend with 3D), lowered opacity for solid colors */}
      <div className="landing-gradient-bg" style={{ opacity: 0.1 }}>
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
      </div>

      {/* 3D Scene Background */}
      <LandingScene />

      <FloatingNav />

      <main className="landing-main">
        <HeroSection />
        <Mission />
        <Features />
        <About />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
