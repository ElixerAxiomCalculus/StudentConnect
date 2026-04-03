import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Microscope, MessageSquare, LayoutDashboard, MessagesSquare, UsersRound, Settings2 } from 'lucide-react';
import './Features.css';

const DoodleSparkle = () => (
  <svg className="section-doodle" style={{ width: 60, height: 60, position: 'absolute', top: '25%', right: '8%', opacity: 0.3, color: '#ffdc82' }} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 0 Q 25 25 50 25 Q 25 25 25 50 Q 25 25 0 25 Q 25 25 25 0 Z" fill="currentColor" />
  </svg>
);

const DoodlePlus = () => (
  <svg className="section-doodle" style={{ width: 40, height: 40, position: 'absolute', bottom: '20%', left: '8%', opacity: 0.2, color: '#d44332' }} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 5 L25 45 M5 25 L45 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
  </svg>
);
import './Features.css';

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: <Microscope size={24} />, title: 'Smart Matching', desc: 'Our cosine-similarity algorithm analyzes personality traits and interests to find your ideal study partners.', color: '#d44332' },
  { icon: <MessageSquare size={24} />, title: 'Real-Time Chat', desc: 'Instant messaging with friends, project groups, and study partners — with reactions, file sharing, and voice notes.', color: '#3d5999' },
  { icon: <LayoutDashboard size={24} />, title: 'Project Hub', desc: 'Create projects, manage Kanban task boards, invite collaborators, and track progress — all in one place.', color: '#27ae60' },
  { icon: <MessagesSquare size={24} />, title: 'Community Forums', desc: 'Reddit-style threaded discussions with upvoting, categories, bookmarks, and nested replies.', color: '#e67e22' },
  { icon: <UsersRound size={24} />, title: 'Study Groups', desc: 'Discover and join study groups or create your own. Find your tribe based on courses and interests.', color: '#9b59b6' },
  { icon: <Settings2 size={24} />, title: 'Personalization', desc: 'Fine-tune your notifications, privacy settings, and accessibility preferences to make it truly yours.', color: '#1abc9c' },
];

const Features = () => {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.features-header > *', {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.15,
        scrollTrigger: { trigger: ref.current, start: 'top 80%' }
      });
      gsap.from('.feature-card', {
        y: 50, opacity: 0, scale: 0.95, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: '.features-grid', start: 'top 85%' }
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="landing-section" id="features" ref={ref} style={{ position: 'relative' }}>
      <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
        <DoodleSparkle />
      </motion.div>
      <motion.div animate={{ y: [0, 20, 0], rotate: [0, -90, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}>
        <DoodlePlus />
      </motion.div>

      <div className="features-header">
        <div className="section-eyebrow">Features</div>
        <h2 className="section-heading">
          Everything you need to<br /><span className="accent-blue">thrive on campus</span>
        </h2>
        <p className="section-copy">
          From finding your study soulmate to managing group projects,
          StudentConnect has you covered.
        </p>
      </div>

      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card glass-card">
            <div className="feature-icon-wrap" style={{ '--fc': f.color }}>
              <span className="feature-icon">{f.icon}</span>
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
            <div className="feature-shine" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;