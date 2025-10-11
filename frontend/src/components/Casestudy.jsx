import React, { memo, useMemo } from 'react';
import "../styles/components/Casestudy.css";
import OptimizedImage from './OptimizedImage';
import gallery1 from "../../src/assets/gallery-1-1.webp";
import gallery2 from "../../src/assets/gallery-1-2.webp";
import gallery3 from "../../src/assets/gallery-1-3.webp";
import gallery4 from "../../src/assets/gallery-1-4.webp";
import gallery5 from "../../src/assets/gallery-1-5.webp";
import gallery6 from "../../src/assets/gallery-1-6.webp";
import gallery7 from "../../src/assets/gallery-1-7.webp";
import gallery8 from "../../src/assets/gallery-1-8.webp";
import { FaEye } from 'react-icons/fa';

const Casestudy = memo(() => {
  const images = useMemo(() => [
    { src: gallery1, title: 'Initial Consultation', subtitle: 'Family Law' },
    { src: gallery2, title: 'Legal Advice', subtitle: 'Divorce Cases' },
    { src: gallery3, title: 'Preliminary Meeting', subtitle: 'Custody Disputes' },
    { src: gallery4, title: 'Client Consultation', subtitle: 'Parental Rights' },
    { src: gallery5, title: 'Advice Session', subtitle: 'Child Support' },
    { src: gallery6, title: 'First Meeting', subtitle: 'Paternity Cases' },
    { src: gallery7, title: 'Introductory Discussion', subtitle: 'Civil Unions' },
    { src: gallery8, title: 'Case Consultation', subtitle: 'Marriage Contracts' },
  ], []);

  return (
    <>
      <div className="casestudy-container">
        <div className="image-grid">
          {images.map((image, index) => (
            <div className="image-container" key={`gallery-${index}`}>
              <OptimizedImage 
                src={image.src} 
                alt={image.title}
              />
              <div className="overlay">
                <button className="eye-button"><FaEye /></button>
                <span className="overlay-text">{image.title}</span>
                <span className="overlay-subtitle">{image.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

Casestudy.displayName = 'Casestudy';

export default Casestudy;
