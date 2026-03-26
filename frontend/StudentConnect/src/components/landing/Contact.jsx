import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <div className="contact-info">
          <h2 className="section-title text-left">Get in Touch</h2>
          <p className="contact-desc">
            Have questions about the algorithm, or want to bring StudentConnect to your campus? Drop us a line!
          </p>
          <div className="dummy-details">
            <p>📧 hello@studentconnect.app</p>
            <p>📍 University Campus Library, 3rd Floor</p>
          </div>
        </div>

        <form className="contact-form">
          <input type="text" placeholder="Your Name" className="glass-input" />
          <input type="email" placeholder="Your University Email" className="glass-input" />
          <textarea placeholder="How can we help?" rows="4" className="glass-input"></textarea>
          <button type="button" className="primary-btn submit-btn">Send Message</button>
        </form>
      </div>
    </section>
  );
};

export default Contact;