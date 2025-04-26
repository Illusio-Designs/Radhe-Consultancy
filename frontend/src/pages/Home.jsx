import React from 'react';
import Header from '../components/Header';
import Workingwith from '../components/Workingwith';

const Home = () => {
  return (
    <>
      <Header />
      <div className="home-container">
        <h1>Home</h1>
      </div>
      <Workingwith />
    </>
  );
}

export default Home;
