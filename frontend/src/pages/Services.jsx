import React from 'react';
import '../styles/Services.css';

const Services = () => {
  const servicesList = [
    {
      title: 'Business Consulting',
      description: 'Strategic planning and business optimization services',
    },
    {
      title: 'Financial Advisory',
      description: 'Expert financial guidance and planning services',
    },
    {
      title: 'Market Research',
      description: 'In-depth market analysis and competitive insights',
    },
    {
      title: 'Risk Management',
      description: 'Comprehensive risk assessment and mitigation strategies',
    }
  ];

  return (
    <div className="services-container">
      <h1>Our Services</h1>
      <div className="services-grid">
        {servicesList.map((service, index) => (
          <div key={index} className="service-card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;