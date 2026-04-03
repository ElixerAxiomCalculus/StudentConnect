import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Building2, Zap, Star, TrendingUp } from 'lucide-react';
import './About.css';

const DoodleChart = () => (
  <svg className="section-doodle" style={{ width: 80, height: 80, position: 'absolute', top: '10%', right: '10%', opacity: 0.2 }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 90 L 90 90 M 10 10 L 10 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M 20 80 L 20 60 M 40 80 L 40 40 M 60 80 L 60 20 M 80 80 L 80 50" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
  </svg>
);

const DoodleGraduation = () => (
  <svg className="section-doodle" style={{ width: 70, height: 70, position: 'absolute', bottom: '15%', left: '5%', opacity: 0.15 }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 40 L 50 20 L 90 40 L 50 60 Z" fill="currentColor" />
    <path d="M 20 50 L 20 70 Q 50 90 80 70 L 80 50" stroke="currentColor" strokeWidth="6" fill="none" />
    <path d="M 90 40 L 90 80" stroke="currentColor" strokeWidth="4" />
  </svg>
);
import './About.css';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '15+', label: 'Universities', icon: <Building2 size={28} /> },
  { value: '50k+', label: 'Matches Made', icon: <Zap size={28} /> },
  { value: '4.9★', label: 'App Rating', icon: <Star size={28} /> },
  { value: '98%', label: 'Retention Rate', icon: <TrendingUp size={28} /> },
];

const steps = [
  { num: '01', title: 'Create Your Profile', desc: 'Sign up, take our personality & interest questionnaire, and let us build your unique student DNA.' },
  { num: '02', title: 'Get Matched', desc: 'Our algorithm finds students who complement your study style, interests, and academic goals.' },
  { num: '03', title: 'Start Collaborating', desc: 'Chat, join projects, create study groups, and build the network that powers your success.' },
];

const About = () => {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-header > *', {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.15,
        scrollTrigger: { trigger: ref.current, start: 'top 80%' }
      });

      gsap.from('.stat-card', {
        y: 40, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: '.stats-row', start: 'top 85%' }
      });

      gsap.from('.step-item', {
        x: -40, opacity: 0, duration: 0.7, stagger: 0.2,
        scrollTrigger: { trigger: '.steps-list', start: 'top 85%' }
      });

      // Counter animation for stats
      document.querySelectorAll('.stat-value').forEach(el => {
        const text = el.textContent;
        const num = parseInt(text.replace(/\D/g, ''));
        if (!num) return;
        const suffix = text.replace(/[\d]/g, '');
        gsap.from(el, {
          textContent: 0,
          duration: 2,
          snap: { textContent: 1 },
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: function () {
            el.textContent = Math.floor(parseFloat(el.textContent)) + suffix;
          }
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="landing-section" id="about" ref={ref} style={{ position: 'relative' }}>
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
        <DoodleChart />
      </motion.div>
      <motion.div animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}>
        <DoodleGraduation />
      </motion.div>

      <div className="about-header">
        <div className="section-eyebrow">How It Works</div>
        <h2 className="section-heading">
          Three steps to your<br /><span style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.25)' }}>dream network</span>
        </h2>
        <p className="section-copy">
          Getting started takes less than 5 minutes. Our intelligent system does the heavy lifting.
        </p>
      </div>

      <div className="about-layout">
        <div className="steps-list">
          {steps.map((s, i) => (
            <div key={i} className="step-item">
              <div className="step-num">{s.num}</div>
              <div className="step-content">
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
              {i < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>

        <div className="stats-row">
          {stats.map((s, i) => (
            <div key={i} className="stat-card glass-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;