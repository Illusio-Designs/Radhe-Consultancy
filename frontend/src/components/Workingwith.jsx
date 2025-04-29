import React from 'react';
import '../styles/components/Workingwith.css';
import img1 from '../assets/brand_1_4-1.svg.png';
import img2 from '../assets/brand_1_5-1.svg.png';
import img3 from '../assets/brand_1_1-1.svg.png';
import img4 from '../assets/brand_1_2-1.svg.png';
import img5 from '../assets/brand_1_3-1.svg.png';
import img6 from '../assets/brand_1_4-1.svg.png';

const Workingwith = () => {
  return (
    <>
    <div className="working-with">
      <h1>We Work With</h1>
      <div className="working-with-items">
        <img src={img1} alt="working-with" />
        <img src={img2} alt="working-with" />
        <img src={img3} alt="working-with" />
        <img src={img4} alt="working-with" />
        <img src={img5} alt="working-with" />
        <img src={img6} alt="working-with" />
      </div>
    </div>
    </>
  );
}

export default Workingwith;
