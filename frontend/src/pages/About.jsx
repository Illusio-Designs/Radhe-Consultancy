import React from 'react';
import Header from '../components/Header';
import Workingwith from '../components/Workingwith';
import Casestudy from '../components/Casestudy';
import Testimonial from '../components/Testimonial';
import Contact from '../components/Contact';
import NewsUpdates from '../components/NewsUpdates';
import Footer from '../components/Footer';
import '../styles/pages/About.css';

const About = () => {
  return (
    <>
      <Header />
      <div className="about-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>About Us</h1>
        </div>
      </div>

      <div className='about-content'></div>  
      <div className='vision-mission'></div>

<div className="help">
  <h1>We Help You With Quality Legal Lawyer</h1>
  <p>Lorem ipsum dolor sit amet consectetur. Commodo pulvinar molestie pellentesque urna libero velit porta. Velit pellentesque hac gravida pellentesque est semper. Duis lectus gravida ultricies eleifend in pharetra faucibus orci sem. </p>
  <div className="help-btn">Contact Now →</div>
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