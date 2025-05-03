import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/pages/Contact.css';
import { FiPhone, FiMapPin, FiMail, FiClock } from 'react-icons/fi';

const Contact = () => {
  return (
    <>
      <Header />
      <div className="contactpage-container">
        <div className="contactpage-hero-section">
          <div className="hero-content">
            <h1>Contact Us</h1>
          </div>
        </div>
        
        <div className="contactpage-content">
          
          <form className="contactpage-form">
          <div className="contactpage-title">
          <h1>Get In Touch</h1>
        </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name*</label>
                <input type="text" id="firstName" name="firstName" placeholder="Enter first name" required />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name*</label>
                <input type="text" id="lastName" name="lastName" placeholder="Enter last name" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Your Phone*</label>
                <input type="tel" id="phone" name="phone" placeholder="Enter your phone" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Your Email*</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message <span className="optional">(optional)</span></label>
              <textarea id="message" name="message" rows="5" placeholder="Enter message"></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message <span className="arrow">→</span></button>
          </form>
          <div className="contactpage-map">
          <iframe src="https://maps.app.goo.gl/d5kE7zgi8KdCT6de7" title="map" style={{ border: 0, width: '100%', height: '350px' }} allowFullScreen="" loading="lazy"></iframe>
          </div>
        </div>
        <div className="contactpage-bottom">
          <div className="contactpage-bottom-item">
            <span className="icon"><FiPhone /></span>
            <span>+91 99130 14575</span>
          </div>
          <div className="contactpage-bottom-item">
            <span className="icon"><FiMapPin /></span>
            <div className="address-block">
              <div>1215 - 1216, RK Empire, Nr. Mavdi Circle, 150 feet Ring Road, Rajkot.</div>
              <div className="branch-address">Branch office - Office no -16, 1st floor, Madhav Market, near Super market, Sanala Road, Morbi, Gujarat</div>
            </div>
          </div>
          <div className="contactpage-bottom-item">
            <span className="icon"><FiMail /></span>
            <span>radheconsultancy17@yahoo.com</span>
          </div>
          <div className="contactpage-bottom-item">
            <span className="icon"><FiClock /></span>
            <span>07.00 am - 09.00 pm</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact; 