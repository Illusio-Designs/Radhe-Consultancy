import React from 'react';
import "../styles/components/Casestudy.css";
import gallery1 from "../../src/assets/gallery-1-1.jpg.png";
import gallery2 from "../../src/assets/gallery-1-2.jpg.png";
import gallery3 from "../../src/assets/gallery-1-3.jpg.png";
import gallery4 from "../../src/assets/gallery-1-4.jpg.png";
import gallery5 from "../../src/assets/gallery-1-5.jpg.png";
import gallery6 from "../../src/assets/gallery-1-6.jpg.png";
import gallery7 from "../../src/assets/gallery-1-7.jpg.png";
import { FaEye } from 'react-icons/fa';

const Casestudy = () => {
  const images = [
    { src: gallery1, title: 'Initial Consultation', subtitle: 'Family Law' },
    { src: gallery2, title: 'Legal Advice', subtitle: 'Divorce Cases' },
    { src: gallery3, title: 'Preliminary Meeting', subtitle: 'Custody Disputes' },
    { src: gallery4, title: 'Client Consultation', subtitle: 'Parental Rights' },
    { src: gallery5, title: 'Advice Session', subtitle: 'Child Support' },
    { src: gallery6, title: 'First Meeting', subtitle: 'Paternity Cases' },
    { src: gallery7, title: 'Introductory Discussion', subtitle: 'Civil Unions' },
    { src: gallery1, title: 'Case Consultation', subtitle: 'Marriage Contracts' },
    // Add more images as needed
  ];

  return (
    <>
      <div className="casestudy-container">
        <div className="casestudy-content">
            <p>Case Study</p>
            <h1>Attoenwy Legal Excellence in Action</h1>
        </div>
        <div className="image-grid">
          {images.map((image, index) => (
            <div className="image-container" key={index}>
              <img src={image.src} alt={image.title} />
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
