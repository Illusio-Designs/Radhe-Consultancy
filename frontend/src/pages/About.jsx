import React, { useState } from 'react';
import Header from '../components/Header';
import Workingwith from '../components/Workingwith';
import Casestudy from '../components/Casestudy';
import Testimonial from '../components/Testimonial';
import Contact from '../components/Contact';
import NewsUpdates from '../components/NewsUpdates';
import Footer from '../components/Footer';
import '../styles/pages/About.css';
import aboutImage from '../assets/business-people-busy-discussing-financial-matter-meeting.jpg';
import avatar1 from '../assets/Ellipse 2603.png';
import avatar2 from '../assets/Ellipse 2606.png';
import group from '../assets/Group 9.png';

const About = () => {
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
      <div className="about-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>About Us</h1>
        </div>
      </div>

      <div className="about-main-section">
  <div className="about-image-section">
    {!loadedImages.has(group) && (
      <div 
        className='group-image' 
        style={{
          backgroundColor: '#f0f0f0',
          filter: 'grayscale(100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '12px'
        }}
      >
        Loading...
      </div>
    )}
    <img 
      src={group} 
      alt="group" 
      className='group-image' 
      onLoad={() => handleImageLoad(group)}
      style={{
        display: loadedImages.has(group) ? 'block' : 'none'
      }}
    />
    <div className="about-image-wrapper">
      {!loadedImages.has(aboutImage) && (
        <div 
          className="about-main-image" 
          style={{
            backgroundColor: '#f0f0f0',
            filter: 'grayscale(100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '12px'
          }}
        >
          Loading...
        </div>
      )}
      <img 
        src={aboutImage} 
        alt="Consultancy" 
        className="about-main-image" 
        onLoad={() => handleImageLoad(aboutImage)}
        style={{
          display: loadedImages.has(aboutImage) ? 'block' : 'none'
        }}
      />
      <div className="about-members-card">
        <span>Monthly Members</span>
        <h2>5000+</h2>
      </div>
      <div className="about-reviews-card">
        <div className="about-reviews-avatars">
          {/* Example avatars */}
          {!loadedImages.has(avatar1) && (
            <div 
              style={{
                backgroundColor: '#f0f0f0',
                filter: 'grayscale(100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '10px',
                width: '40px',
                height: '40px',
                borderRadius: '50%'
              }}
            >
              L
            </div>
          )}
          <img 
            src={avatar1} 
            alt="avatar" 
            onLoad={() => handleImageLoad(avatar1)}
            style={{
              display: loadedImages.has(avatar1) ? 'block' : 'none'
            }}
          />
          {!loadedImages.has(avatar2) && (
            <div 
              style={{
                backgroundColor: '#f0f0f0',
                filter: 'grayscale(100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '10px',
                width: '40px',
                height: '40px',
                borderRadius: '50%'
              }}
            >
              L
            </div>
          )}
          <img 
            src={avatar2} 
            alt="avatar" 
            onLoad={() => handleImageLoad(avatar2)}
            style={{
              display: loadedImages.has(avatar2) ? 'block' : 'none'
            }}
          />
          <div className='plus-icon'>+</div>
        </div>
        <span>8000+ reviews</span>
      </div>
    </div>
  </div>
  <div className="about-story-section">
    <span className="about-story-label">About Us</span>
    <h1>Discover Our Story</h1>
    <p className="about-story-desc">
      Raj Consultancy is Hr & Labor Law Compliance Outsourcing Company. Our Team Consist Of Extremely Proficient And Dedicated Labor Law Experts With Remarkable 09 Years Of Experience In This Field Who Ensures Complete Compliance Under Various Labour Law. We Have Expanded Our 7 Branches In Gujarat, With More Than 1000+ Satisfied Clients.
    </p>
    <p className="about-story-highlight">
      We Provide Best Consultancy services Since 2016 for business.
    </p>
    <button className="about-contact-btn" onClick={handleContactClick}>Contact Now →</button>
  </div>
</div>

<div className="vision-mission-section">
  <div className="vision-section">
    <div className="section-title-with-line">
    <h2>Our Vision</h2>
      <div className="section-line" />
    </div>
      
    <p>
      At raj consultancy, our mission is clear and resolute – to empower organizations and individuals to thrive in today's dynamic and ever-evolving landscape. We believe that success is achieved through strategic excellence, and we are committed to being your partner on this journey.
    </p>
  </div>
  <div className="mission-section">
    <div className="section-title-with-line">
    <h2>Our Mission</h2>
      <div className="section-line" />
      
    </div>
    <p>
      At raj consultancy, our vision is to be the guiding light that illuminates the path to success for individuals and organizations alike. We aspire to be the catalyst that empowers our clients to embrace change, embrace innovation, and shape a future that surpasses their greatest expectations.
    </p>
  </div>
</div>

<div className="help">
  <h1>We Help You With Quality Legal Lawyer</h1>
  <p>Lorem ipsum dolor sit amet consectetur. Commodo pulvinar molestie pellentesque urna libero velit porta. Velit pellentesque hac gravida pellentesque est semper. Duis lectus gravida ultricies eleifend in pharetra faucibus orci sem. </p>
  <div className="help-btn" onClick={handleContactClick}>Contact Now →</div>
</div>



      <div className="casestudy">
      <div className="casestudy-content">
            <p>Our Gallery</p>
            <h1>Gallery of Inspiration</h1>
            <div className='case-study-btn'>View More</div>
        </div>
      <Casestudy />
        </div>
        <Workingwith />
        <Testimonial />
        <Contact />
        <NewsUpdates />
      </div>
      <Footer />
    </>
  );
};

export default About; 