import React, { useState } from 'react';
import "../styles/components/Casestudy.css";
import gallery1 from "../../src/assets/gallery-1-1.jpg";
import gallery2 from "../../src/assets/gallery-1-2.jpg";
import gallery3 from "../../src/assets/gallery-1-3.jpg";
import gallery4 from "../../src/assets/gallery-1-4.jpg";
import gallery5 from "../../src/assets/gallery-1-5.jpg";
import gallery6 from "../../src/assets/gallery-1-6.jpg";
import gallery7 from "../../src/assets/gallery-1-7.jpg";
import gallery8 from "../../src/assets/gallery-1-8.jpg";
import { FaEye } from 'react-icons/fa';

const Casestudy = () => {
  const [loadedImages, setLoadedImages] = useState(new Set());

  const handleImageLoad = (imageSrc) => {
    setLoadedImages(prev => new Set([...prev, imageSrc]));
  };

  const images = [
    { src: gallery1, title: 'Initial Consultation', subtitle: 'Family Law' },
    { src: gallery2, title: 'Legal Advice', subtitle: 'Divorce Cases' },
    { src: gallery3, title: 'Preliminary Meeting', subtitle: 'Custody Disputes' },
    { src: gallery4, title: 'Client Consultation', subtitle: 'Parental Rights' },
    { src: gallery5, title: 'Advice Session', subtitle: 'Child Support' },
    { src: gallery6, title: 'First Meeting', subtitle: 'Paternity Cases' },
    { src: gallery7, title: 'Introductory Discussion', subtitle: 'Civil Unions' },
    { src: gallery8, title: 'Case Consultation', subtitle: 'Marriage Contracts' },
    // Add more images as needed
  ];

  return (
    <>
      <div className="casestudy-container">
        <div className="image-grid">
          {images.map((image, index) => (
            <div className="image-container" key={index}>
              {!loadedImages.has(image.src) && (
                <div 
                  style={{
                    backgroundColor: '#f0f0f0',
                    filter: 'grayscale(100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '12px',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                >
                </div>
              )}
              <img 
                src={image.src} 
                alt={image.title} 
                onLoad={() => handleImageLoad(image.src)}
                style={{
                  display: loadedImages.has(image.src) ? 'block' : 'none',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
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
}

export default Casestudy;
