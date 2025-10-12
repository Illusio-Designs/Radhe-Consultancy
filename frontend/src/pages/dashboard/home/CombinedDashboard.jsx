import React, { useEffect, memo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";

const CombinedDashboard = memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  return (
    <div className="combined-dashboard">
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <h1 className="coming-soon-title">Coming Soon</h1>
          <p className="coming-soon-subtitle">
            We're working on something amazing for you!
          </p>
          <div className="coming-soon-icon">🚀</div>
        </div>
      </div>
    </div>
  );
});

CombinedDashboard.displayName = 'CombinedDashboard';

export default CombinedDashboard;
