import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Testimonial from '../components/Testimonial';
import Contact from '../components/Contact';
import NewsUpdates from '../components/NewsUpdates';
import { 
  HiBuildingOffice2,
  HiDocumentCheck,
  HiHeart,
  HiUserGroup,
  HiCurrencyDollar,
  HiBuildingStorefront,
  HiDocumentText,
  HiGift,
  HiStar,
  HiUsers,
  HiOutlineArrowRight
} from 'react-icons/hi2';
import left from "../assets/blog-1-shape-left.png.png";
import right from "../assets/blog-1-shape-right.png.png";

import '../styles/pages/Compliance.css';

const Compliance = () => {
  const handleContactClick = () => {
    window.location.href = '/contact';
  };

  const complianceServices = [
    {
      title: "Factory Act License",
      description: "Complete factory compliance and testing services for your manufacturing setup",
      Icon: HiBuildingOffice2
    },
    {
      title: "Digital Signature",
      description: "Secure digital signature certification for all your business transactions and legal documents",
      Icon: HiDocumentCheck
    },
    {
      title: "ESIC Registration",
      description: "Employee state insurance registration for workplace and employee benefits",
      Icon: HiHeart
    },
    {
      title: "Contract Labor Act",
      description: "Stay legal with proper contract labor act compliance and documentation",
      Icon: HiUserGroup
    },
    {
      title: "Provident Fund Act",
      description: "EPF/Provident Fund (PF) registration and ongoing compliance",
      Icon: HiCurrencyDollar
    },
    {
      title: "Bombay Shops & Establishment Act",
      description: "Registration and compliance with shops and establishment regulations",
      Icon: HiBuildingStorefront
    },
    {
      title: "Professional Tax Registration",
      description: "Professional tax registration and compliance for your business",
      Icon: HiDocumentText
    },
    {
      title: "Gratuity Act Compliance",
      description: "Management and compliance of gratuity benefits for employees",
      Icon: HiGift
    },
    {
      title: "Bonus Act Compliance",
      description: "Legal compliance with bonus act regulations and employee benefits",
      Icon: HiStar
    },
    {
      title: "Employee's Compensation Act",
      description: "Proper management of employee compensation and related compliance",
      Icon: HiUsers
    }
  ];

  return (
    <>
      <Header />
      <div className="compliance">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Compliance & Licensing</h1>
        </div>
      </div>
      <div className="page-container">
      <img src={left} alt="left" className="left-shape" />
      <img src={right} alt="right" className="right-shape" />
        <div className="services-grid">
          {complianceServices.map((service, index) => (
            <div key={index} className="service-card">
              <div className="card-inner">
                <div className="icon-container">
                  <service.Icon />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
              <div className="overlay">
                <span className="overlay-text" onClick={handleContactClick}>Contact Now →</span>
              </div>
            </div>
          ))}
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

export default Compliance; 