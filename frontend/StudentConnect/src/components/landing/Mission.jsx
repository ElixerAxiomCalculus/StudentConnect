import React from 'react';
import './Mission.css';

const Mission = () => {
  return (
    <section className="mission-section" id="mission">
      <div className="mission-content">
        <h2 className="section-title">Our Mission</h2>
        <p className="mission-text">
          We believe finding the right study group shouldn't be left to chance. 
          StudentConnect exists to break down campus silos and pair you with peers 
          who share your exact academic goals, schedule, and vibe.
        </p>
        
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Majors Supported</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">95%</span>
            <span className="stat-label">Match Satisfaction</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">10k+</span>
            <span className="stat-label">Study Sessions</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;