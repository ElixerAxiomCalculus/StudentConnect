import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  return (
    <div className="landing-ambient" aria-hidden="true">
      <div className="landing-ambient__gradient" />
      <div className="landing-ambient__orb landing-ambient__orb--coral" />
      <div className="landing-ambient__orb landing-ambient__orb--blue" />
      <div className="landing-ambient__orb landing-ambient__orb--sky" />
      <div className="landing-ambient__mesh" />
      <div className="landing-ambient__noise" />
    </div>
  );
};

export default AnimatedBackground;
