import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  return (
    <div className="animated-bg-container">

      <div className="color-orb orb-1"></div>
      <div className="color-orb orb-2"></div>
      <div className="color-orb orb-3"></div>
      
      <div className="grain-overlay"></div>
    </div>
  );
};

export default AnimatedBackground;