import React, { useState, useEffect, memo } from 'react';
import '../styles/components/Testimonial.css';

const testimonials = [
  {
    text: "I had been facing challenges with family law for months until I discovered abc. They not only resolved my issues effectively but also guided me on how to avoid similar problems in the future. Their team is highly skilled, patient, and always prioritizes customer satisfaction. I truly appreciate their support and would highly recommend them to others.",
    author: "Teresa Hamilton",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    text: "Navigating family law issues was overwhelming until I came across abc. They empowered me with knowledge to manage such situations better. Their expertise and dedication to client satisfaction left a lasting impression.",
    author: "Monks Millar",
    rating: 5
  },
  {
    text: "Best decision ever! abc helped me resolve complex family issues swiftly and professionally. I can't recommend them enough.",
    author: "John Doe",
    rating: 5
  },
  {
    text: "Superb experience! Professional, patient, and knowledgeable. abc made the whole process smooth and stress-free.",
    author: "Jane Smith",
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
