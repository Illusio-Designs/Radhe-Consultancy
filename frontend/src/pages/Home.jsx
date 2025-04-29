import React from 'react';
import Header from '../components/Header';
import Workingwith from '../components/Workingwith';
import Casestudy from '../components/Casestudy';
import Testimonial from '../components/Testimonial';
import Contact from '../components/Contact';
import NewsUpdates from '../components/NewsUpdates';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <>
      <Header />
      <div className="home-container">
      
      </div>
      <Workingwith />
      <Casestudy />
      <Testimonial />
      <Contact />
      <NewsUpdates />
      <Footer />
    </>
  );
}

export default Home;
