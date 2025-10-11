import React, { memo } from 'react';
import OptimizedImage from '../OptimizedImage';
import { FaEnvelopeOpenText, FaBalanceScale, FaPencilRuler } from "react-icons/fa";

const WhyChooseUs = memo(({ img9, img10 }) => {
  return (
    <div className="why">
      {/* Left Section: Image with Play Button */}
      <div className="why-left">
        <div className="video-thumbnail">
          <OptimizedImage src={img9} alt="Gavel and Sand Timer" className="video-img" />
          <div className="play-button">
            <div className="circle">
              <div className="triangle"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Content */}
      <div className="why-right">
        <OptimizedImage src={img10} alt="Law Scale" className="img10" />
        <p className="why-subtitle">Why Choose Us?</p>
        <h2 className="why-title">Navigating The Law: Your Assurance Of Peace</h2>

        <div className="points">
          <div className="why-point">
            <div className="icon-circle"><FaEnvelopeOpenText /></div>
            <div>
              <h3>Initial Consultation</h3>
              <p>Our experienced lawyers thoroughly analyze the facts of each case. Then they apply the relevant laws to provide clear advice.</p>
            </div>
          </div>

          <div className="why-point">
            <div className="icon-circle"><FaBalanceScale /></div>
            <div>
              <h3>Case Evaluation</h3>
              <p>We prioritize understanding your concerns and aligning with your goals. Your satisfaction is our top priority.</p>
            </div>
          </div>

          <div className="why-point">
            <div className="icon-circle"><FaPencilRuler /></div>
            <div>
              <h3>Legal Strategy</h3>
              <p>We develop a customized plan to protect your rights and achieve the best possible outcome.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

WhyChooseUs.displayName = 'WhyChooseUs';

export default WhyChooseUs;

