import React, { memo } from 'react';
import OptimizedImage from '../OptimizedImage';

const TrustedConsultancy = memo(({ 
  img, img2, img3, img6, img7, img8, 
  handleAboutClick 
}) => {
  return (
    <div className="trusted-consultancy">
      <OptimizedImage src={img6} alt="Law Scale" className="img6" />
      <OptimizedImage src={img7} alt="Law Scale" className="img7" />
      <OptimizedImage src={img8} alt="Law Scale" className="img8" />
      <div className="trusted-container">
        <div className="trusted-left">
          <div className="image-group">
            <div className='img-left'>
              <OptimizedImage src={img} alt="Law Scale" className="img1" />
            </div>
            <div className='img-right'>
              <OptimizedImage src={img2} alt="Lawyer" className="img2" />
              <OptimizedImage src={img3} alt="Gavel on Books" className="img3" />
            </div>
          </div>
        </div>
        <div className="trusted-right">
          <p className="about-subtitle">About Us</p>
          <h2>Your Trusted Consultancy</h2>
          <p className="about-description">
            With years of experience, we provide expert legal services across various domains. Our mission is to offer strategic, client-focused legal solutions that protect your rights and interests.
          </p>
          <button className="more-about-btn" onClick={handleAboutClick}>More About →</button>
        </div>
      </div>
    </div>
  );
});

TrustedConsultancy.displayName = 'TrustedConsultancy';

export default TrustedConsultancy;

