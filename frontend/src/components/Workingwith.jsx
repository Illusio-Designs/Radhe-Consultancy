import React, { memo } from 'react';
import '../styles/components/Workingwith.css';
import OptimizedImage from './OptimizedImage';
import img1 from '../assets/brand_1_4-1.svg.webp';
import img2 from '../assets/brand_1_5-1.svg.webp';
import img3 from '../assets/brand_1_1-1.svg.webp';
import img4 from '../assets/brand_1_2-1.svg.webp';
import img5 from '../assets/brand_1_3-1.svg.webp';
import img6 from '../assets/brand_1_4-1.svg.webp';

const Workingwith = memo(() => {
  return (
    <>
    <div className="working-with">
      <h1>We Work With</h1>
      <div className="working-with-items">
        <OptimizedImage src={img1} alt="working-with" />
        <OptimizedImage src={img2} alt="working-with" />
        <OptimizedImage src={img3} alt="working-with" />
        <OptimizedImage src={img4} alt="working-with" />
        <OptimizedImage src={img5} alt="working-with" />
        <OptimizedImage src={img6} alt="working-with" />
      </div>
    </div>
    </>
  );
});

Workingwith.displayName = 'Workingwith';

export default Workingwith;
