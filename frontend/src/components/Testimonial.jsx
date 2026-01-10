import React, { useState, useEffect, memo } from 'react';
import '../styles/components/Testimonial.css';

const testimonials = [
  {
    text: "Radhe Consultancy helped us renew our factory license within just 15 days without any production downtime. Their team handled all documentation and regulatory coordination seamlessly. Their expertise in Factory Act compliance is unmatched, and their proactive approach saved us both time and money. Highly recommend their services to any manufacturing business.",
    author: "Rajesh Patel",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    text: "Our ESIC registration was completed smoothly thanks to Radhe Consultancy's expert guidance. They explained every step clearly and ensured all our employees were properly covered. Their knowledge of labor law compliance is exceptional, and they continue to support us with ongoing compliance requirements.",
    author: "Priya Sharma",
    rating: 5
  },
  {
    text: "When our commercial vehicle met with an accident, Radhe Consultancy processed our motor insurance claim of ₹2.5 lakhs within 30 days. Their documentation support and follow-up with the insurance company was outstanding. They truly understand the insurance industry inside out.",
    author: "Amit Desai",
    rating: 5
  },
  {
    text: "DSC implementation for our 50+ employees was handled professionally by Radhe Consultancy. They provided complete training and setup, making our digital operations seamless. Their technical expertise and customer service approach is commendable. Best investment for our company's digital transformation.",
    author: "Neha Mehta",
    rating: 5
  },
  {
    text: "Fire insurance claim of ₹15 lakhs for our textile factory was settled successfully with Radhe Consultancy's support. They prepared all documentation meticulously and coordinated with insurance surveyors effectively. Their experience in handling complex insurance claims is remarkable.",
    author: "Kiran Shah",
    rating: 5
  },
  {
    text: "Labour license compliance audit for our 100+ employee unit was conducted thoroughly by Radhe Consultancy. They identified all gaps and helped us achieve full compliance within the deadline. Their systematic approach and regulatory knowledge is impressive.",
    author: "Vikram Joshi",
    rating: 5
  }
];

const Testimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(2); // Default state for visible cards

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 500) {
        setVisibleCards(1);
      } else {
        setVisibleCards(2);
      }
    };

    window.addEventListener('resize', handleResize);

    // Call handleResize initially in case the window size is already less than 500
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < visibleCards; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <div className="testimonial-container">
      <p className="section-title">Client Testimonials</p>

      <div className="testimonial-heading-nav">
        <h2 className="section-heading">What Our Clients Say</h2>
        <div className="testimonial-nav">
          <button className="nav-button" onClick={prevSlide}>←</button>
          <button className="nav-button" onClick={nextSlide}>→</button>
        </div>
      </div>

      <div className="testimonial-slider">
        {visibleTestimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <div className="testimonial-header">
              <div>
                <h4 className="author-name">{testimonial.author}</h4>
                <div className="author-rating">
                  {'★'.repeat(testimonial.rating)}
                </div>
              </div>
              <div className="quote-icon">❝</div>
            </div>
            <p className="testimonial-text">{testimonial.text}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default memo(Testimonial);
