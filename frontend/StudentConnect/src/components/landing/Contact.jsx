import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';
import './Contact.css';

const DoodleMail = () => (
  <svg className="section-doodle" style={{ width: 50, height: 50, position: 'absolute', top: '15%', left: '10%', opacity: 0.3 }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 30 L 90 30 L 90 70 L 10 70 Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
    <path d="M 10 30 L 50 60 L 90 30" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
  </svg>
);

const DoodleWave = () => (
  <svg className="section-doodle" style={{ width: 120, height: 40, position: 'absolute', bottom: '15%', right: '5%', opacity: 0.2 }} viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 0 25 Q 12.5 0 25 25 T 50 25 T 75 25 T 100 25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);
import './Contact.css';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const ref = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact-inner > *', {
        y: 40, opacity: 0, duration: 0.7, stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: 'top 80%' }
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section className="landing-section" id="contact" ref={ref} style={{ position: 'relative' }}>
      <motion.div animate={{ y: [-10, 10, -10], rotate: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}>
        <DoodleMail />
      </motion.div>
      <motion.div animate={{ x: [-20, 20, -20] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}>
        <DoodleWave />
      </motion.div>

      <div className="contact-wrapper glass-card">
        <div className="contact-inner">
          <div className="contact-info">
            <div className="section-eyebrow">Get In Touch</div>
            <h2 className="section-heading">
              Have a question?<br /><span className="accent">Let's talk.</span>
            </h2>
            <p className="section-copy">
              Whether you're a student, university admin, or just curious —
              we'd love to hear from you.
            </p>

            <div className="contact-cards">
              <div className="contact-chip">
                <span className="chip-icon"><Mail size={22} className="accent" /></span>
                <div>
                  <div className="chip-label">Email</div>
                  <div className="chip-value">hello@studentconnect.io</div>
                </div>
              </div>
              <div className="contact-chip">
                <span className="chip-icon"><MapPin size={22} className="accent" /></span>
                <div>
                  <div className="chip-label">Location</div>
                  <div className="chip-value">Kolkata, India</div>
                </div>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="cf-group">
              <label>Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
            </div>
            <div className="cf-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@university.edu" required />
            </div>
            <div className="cf-group">
              <label>Message</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us what's on your mind..." rows={4} required />
            </div>
            <button type="submit" className="lp-btn lp-btn--primary" style={{ width: '100%' }}>
              {sent ? '✓ Message Sent!' : 'Send Message →'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;