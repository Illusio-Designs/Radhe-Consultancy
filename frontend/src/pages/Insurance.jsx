import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Testimonial from '../components/Testimonial';
import Contact from '../components/Contact';
import NewsUpdates from '../components/NewsUpdates';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import '../styles/pages/Insurance.css';

const Insurance = () => {
  const [loadedImages, setLoadedImages] = useState(new Set());

  const handleImageLoad = (imageSrc) => {
    setLoadedImages(prev => new Set([...prev, imageSrc]));
  };
  const handleContactClick = () => {
    window.location.href = '/contact';
  };

  return (
    <>
      <Header />
      <div className="insurance-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Insurance</h1>
        </div>
      </div>

      <div className="page-container">
        <div className="services-grid">
          <div className="service-card">
            <div className="card-inner">
              <div className="icon-container">
                <i className="fas fa-car"></i>
              </div>
              <h3>Motor & Vehicle Insurance Claims</h3>
              <p>Expert assistance for motor vehicle insurance claims and settlements.</p>
            </div>
            <div className="overlay" >
            <span className="overlay-text" onClick={handleContactClick}>Contact Now →</span>
            </div>
          </div>
          
          <div className="service-card">
            <div className="card-inner">
              <div className="icon-container">
                <i className="fas fa-hand-holding-medical"></i>
              </div>
              <h3>Health Insurance Legal Assistance</h3>
              <p>We help resolve medical claim disputes and insurance settlement concerns.</p>
            </div>
            <div className="overlay" >
            <span className="overlay-text" onClick={handleContactClick}>Contact Now →</span>
            </div>
          </div>

          <div className="service-card">
            <div className="card-inner">
              <div className="icon-container">
                <i className="fas fa-ship"></i>
              </div>
              <h3>Marine Insurance Claims</h3>
              <p>Covering cargo damage, ship-to-shore, and marine liability issues.</p>
            </div>
            <div className="overlay" >
            <span className="overlay-text" onClick={handleContactClick}>Contact Now →</span>
            </div>
          </div>

          <div className="service-card">
            <div className="card-inner">
              <div className="icon-container">
                <i className="fas fa-fire-extinguisher"></i>
              </div>
              <h3>Fire Insurance Disputes</h3>
              <p>Assistance in property damage claims and insurance service.</p>
            </div>
            <div className="overlay">
            <span className="overlay-text" onClick={handleContactClick}>Contact Now →</span>
            </div>
          </div>

          <div className="service-card">
            <div className="card-inner">
              <div className="icon-container">
                <i className="fas fa-user-shield"></i>
              </div>
              <h3>Employee Compensation Policy</h3>
              <p>Helping employees deal with injury benefits compensation settlements.</p>
            </div>
            <div className="overlay" >
            <span className="overlay-text" onClick={handleContactClick}>Contact Now →</span>
            </div>
          </div>
        </div>
      </div>
      
      <Testimonial />
      <Contact />
      <NewsUpdates />
      </div>
      <Footer />
    </>
  );
};

export default Insurance; 