import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Users, Lightbulb, Rocket } from 'lucide-react';
import './Mission.css';

const DoodleGear = () => (
  <svg className="section-doodle" style={{ width: 80, height: 80, position: 'absolute', top: '15%', left: '5%', opacity: 0.2 }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20 A 30 30 0 1 0 80 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 10" />
    <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="6" />
    <path d="M50 5 L50 20 M95 50 L80 50 M50 95 L50 80 M5 50 L20 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const DoodleAtom = () => (
  <svg className="section-doodle" style={{ width: 100, height: 100, position: 'absolute', bottom: '10%', right: '5%', opacity: 0.15 }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(30 50 50)" stroke="currentColor" strokeWidth="4" />
    <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(120 50 50)" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="50" r="8" fill="currentColor" />
  </svg>
);
import './Mission.css';

gsap.registerPlugin(ScrollTrigger);

const values = [
  { icon: <Users size={32} strokeWidth={1.5} />, title: 'Meaningful Connections', desc: 'Our algorithm matches you with peers based on personality, interests, and academic goals — not just random chance.' },
  { icon: <Lightbulb size={32} strokeWidth={1.5} />, title: 'Smarter Together', desc: 'Collaborative learning accelerates growth. Find study partners who challenge and inspire you to reach new heights.' },
  { icon: <Rocket size={32} strokeWidth={1.5} />, title: 'Launch Your Network', desc: 'Build the professional relationships today that will define your career tomorrow. Start early, start smart.' },
];

const Mission = () => {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.mission-header > *', {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.15,
        scrollTrigger: { trigger: ref.current, start: 'top 80%' }
      });
      gsap.from('.value-card', {
        y: 60, opacity: 0, duration: 0.7, stagger: 0.15,
        scrollTrigger: { trigger: '.values-grid', start: 'top 85%' }
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="landing-section" id="mission" ref={ref} style={{ position: 'relative' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>
        <DoodleGear />
      </motion.div>
      <motion.div animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}>
        <DoodleAtom />
      </motion.div>

      <div className="mission-header">
        <div className="section-eyebrow">Our Mission</div>
        <h2 className="section-heading">
          College is better<br />with the <span style={{ color: '#00f2fe' }}>right people</span>
        </h2>
        <p className="section-copy">
          We believe every student deserves a network that makes learning feel effortless
          and campus life unforgettable.
        </p>
      </div>

      <div className="values-grid">
        {values.map((v, i) => (
          <div key={i} className="value-card glass-card">
            <div className="value-icon">{v.icon}</div>
            <h3 className="value-title">{v.title}</h3>
            <p className="value-desc">{v.desc}</p>
            <div className="value-number">{String(i + 1).padStart(2, '0')}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Mission;