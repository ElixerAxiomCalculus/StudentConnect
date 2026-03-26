import React from 'react';
import './Features.css';

const Features = () => {
  const featureList = [
    {
      icon: '🧠',
      title: 'Smart Algorithm',
      desc: 'Our system matches you based on classes, study habits, and personal interests.'
    },
    {
      icon: '🔒',
      title: 'Verified Students',
      desc: 'A secure platform requiring a valid university .edu email to join the network.'
    },
    {
      icon: '💬',
      title: 'Instant Chat',
      desc: 'Break the ice quickly with our built-in secure messaging system.'
    }
  ];

  return (
    <section className="features-section" id="features">
      <h2 className="section-title">Why StudentConnect?</h2>
      
      <div className="features-grid">
        {featureList.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;