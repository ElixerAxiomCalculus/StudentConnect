import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section" id="home">
      <div className="hero-content">
        <h1 className="hero-title">
          Find Your Perfect <br />
          <span className="text-highlight">Study Match</span>
        </h1>
        
        <p className="hero-subtitle">
          Connect with peers who share your major, passions, and study habits. 
          Because college is better when you build the right network.
        </p>
        
        <div className="hero-buttons">
          <button 
            className="primary-btn"
            onClick={() => navigate('/results')}
          >
            Get Started
          </button>
          
          <button 
            className="secondary-btn"
            onClick={() => {
              document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How it Works
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;