import React from 'react';
import FloatingNav from '../components/landing/FloatingNav';
import HeroSection from '../components/landing/HeroSection';
import Mission from '../components/landing/Mission';
import Features from '../components/landing/Features';
import About from '../components/landing/About';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';
import './LandingPage.css'; 

const LandingPage = () => {
  return (
    <div 
      className="landing-container"
    >
      <FloatingNav />
      
      <main>
        <HeroSection />
        <Mission/>
        <Features/>
        <About/>
        <Contact/>
      </main>
      <Footer/>
    </div>
  );
};

export default LandingPage;