import React, { useState, useEffect } from 'react';
import { Progress } from 'antd';
import '../styles/auth/Auth.css';

const ComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    progress: 0
  });

  useEffect(() => {
    // Set launch date to 120 days from now
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 120);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      // Calculate time units
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Calculate progress (inverse of days left as a percentage)
      const progress = Math.floor(((120 - days) / 120) * 100);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        progress
      });

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          progress: 100
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="auth-container coming-soon">
      <div className="auth-card">
        <div className="auth-content">
          <h1 className="auth-title">Coming Soon</h1>
          <h2 className="auth-subtitle">We're Working Hard to Bring You Something Amazing</h2>
          
          <div className="countdown-container">
            <Progress
              type="circle"
              percent={timeLeft.progress}
              format={() => `${timeLeft.days} Days`}
              size={200}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            
            <div className="countdown-details">
              <div className="countdown-item">
                <span className="countdown-value">{timeLeft.hours}</span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-value">{timeLeft.minutes}</span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-value">{timeLeft.seconds}</span>
                <span className="countdown-label">Seconds</span>
              </div>
            </div>
          </div>

          <div className="coming-soon-footer">
            <p>Stay tuned for something amazing!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon; 