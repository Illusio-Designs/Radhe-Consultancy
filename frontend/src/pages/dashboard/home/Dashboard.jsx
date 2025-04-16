import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";
import CompanyDashboard from "./CompanyDashboard";
import ConsumerDashboard from "./ConsumerDashboard";
import "../../../styles/pages/dashboard/home/Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Get the role from either role_name or role property
  const userRole = user?.role_name || user?.role;
  console.log("Dashboard: User data:", user);
  console.log("Dashboard: User role:", userRole);

  // Render different dashboards based on user role
  switch (userRole?.toLowerCase()) {
    case "admin":
      return <AdminDashboard />;
    case "company":
      return <CompanyDashboard />;
    case "consumer":
      return <ConsumerDashboard />;
    default:
      return (
        <div className="dashboard-error">
          <h2>Access Denied</h2>
          <p>You don't have permission to view this dashboard.</p>
          <p>Role: {userRole || 'No role assigned'}</p>
          <p>User data: {JSON.stringify(user, null, 2)}</p>
        </div>
      );
  }
};

export default Dashboard;
