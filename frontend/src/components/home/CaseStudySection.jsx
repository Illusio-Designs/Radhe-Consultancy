import React, { memo } from 'react';
import Casestudy from '../Casestudy';

const CaseStudySection = memo(() => {
  return (
    <div className="casestudy">
      <div className="casestudy-content">
        <p>Case Study</p>
        <h1>Attorney Legal Excellence in Action</h1>
      </div>
      <Casestudy />
    </div>
  );
});

CaseStudySection.displayName = 'CaseStudySection';

export default CaseStudySection;

