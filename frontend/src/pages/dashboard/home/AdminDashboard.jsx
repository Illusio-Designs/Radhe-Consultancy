import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiPackage,
  FiHome,
  FiTarget,
  FiRefreshCw,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { adminAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/home/Dashboard.css";

const StatCard = ({ icon: Icon, title, value, change }) => (
  <div className="stat-card">
    <div className="stat-card-content">
      <div className="stat-card-header">
        <div className="stat-icon-container">
          <Icon className="stat-icon" />
        </div>
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          <div className="stat-value">{value}</div>
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("7days");
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalConsumers: 0,
    activeCompanies: 0,
    activeConsumers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getAdminStats();
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000); // Ensure loader is displayed for at least 2000ms
    }
  };

  const adminStats = [
    {
      id: 1,
      title: "Total Companies",
      value: stats.totalCompanies,
      icon: FiPackage,
    },
    {
      id: 2,
      title: "Total Consumers",
      value: stats.totalConsumers,
      icon: FiUsers,
    },
    {
      id: 3,
      title: "Active Companies",
      value: stats.activeCompanies,
      icon: FiTarget,
    },
    {
      id: 4,
      title: "Active Consumers",
      value: stats.activeConsumers,
      icon: FiHome,
    },
  ];

 

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchStats();
    } catch (error) {
      console.error("Error refreshing admin stats:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000); // Ensure loader is displayed for at least 2000ms
    }
  };

  const handleFilterChange = (e) => {
    setTimeFilter(e.target.value);
    handleRefresh();
  };

  return (
    <div className="dashboard-page">
      {isLoading ? (
        <div className="loader-container">
          <Loader size="large" color="primary" />
        </div>
      ) : (
        <>
          <div className="dashboard-header">
            <div className="dashboard-title-area">
              <h1>Admin Dashboard</h1>
              <div className="dashboard-meta">
                <span className="last-updated">
                  <FiClock className="meta-icon" /> Last updated: {lastUpdated}
                </span>
                <button
                  className={`refresh-button ${isLoading ? "refreshing" : ""}`}
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <FiRefreshCw className="refresh-icon" />
                  {isLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
            <div className="date-filter">
              <FiCalendar className="filter-icon" />
              <select value={timeFilter} onChange={handleFilterChange}>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 3 months</option>
              </select>
            </div>
          </div>

          <div className="stats-grid">
            {adminStats.map((stat) => (
              <StatCard
                key={stat.id}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
