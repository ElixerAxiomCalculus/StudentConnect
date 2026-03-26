import React from 'react';
import './About.css';

const About = () => {
  const teamMembers = [
    { name: 'Akshat Goel', role: 'BackEnd Developer', seed: 'Akshat' },
    { name: 'Sandeepan Koley', role: 'BackEnd Developer', seed: 'Sandeepan' },
    { name: 'Satyam kumar', role: 'FrontEnd Developer', seed: 'Satyam' },
    { name: 'Sayak Mondal', role: 'FrontEnd Developer', seed: 'Sayak' },
    { name: 'Vivek kumar', role: 'FrontEnd Developer', seed: 'Vivek' }
  ];

  return (
    <section className="about-section" id="about">
      <h2 className="section-title">Meet the Team</h2>
      <p className="about-subtitle">The students building StudentConnect.</p>
      
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <div className="team-card" key={index}>
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.seed}`} 
              alt={member.name} 
              className="team-avatar"
            />
            <h3 className="team-name">{member.name}</h3>
            <p className="team-role">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;