import React, { useState, useEffect } from "react";
import {
  FiPackage,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiXCircle,
  FiClock as FiRecent
} from "react-icons/fi";
import { adminDashboardAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/home/Dashboard.css";

const CompanyStatsCard = ({ stats }) => (
  <div className="company-stats-card">
    <div className="company-stats-header">
      <div className="company-stats-title">
        <FiPackage className="stats-icon" />
        <h2>Company Statistics</h2>
      </div>
    </div>
    
    <div className="company-stats-grid">
      <div className="company-stat-item total">
        <div className="stat-label">Total Companies</div>
        <div className="stat-value">{stats.total_companies}</div>
      </div>

      <div className="company-stat-item active">
        <div className="stat-label">
          <FiCheckCircle className="stat-icon" />
          Active Companies
        </div>
        <div className="stat-value">{stats.active_companies}</div>
        <div className="stat-percentage">
          {Math.round((stats.active_companies / stats.total_companies) * 100)}% of total
        </div>
      </div>

      <div className="company-stat-item inactive">
        <div className="stat-label">
          <FiXCircle className="stat-icon" />
          Inactive Companies
        </div>
        <div className="stat-value">{stats.inactive_companies}</div>
        <div className="stat-percentage">
          {Math.round((stats.inactive_companies / stats.total_companies) * 100)}% of total
        </div>
      </div>

      <div className="company-stat-item recent">
        <div className="stat-label">
          <FiRecent className="stat-icon" />
          Recent Companies (30 days)
        </div>
        <div className="stat-value">{stats.recent_companies}</div>
        <div className="stat-percentage">
          {Math.round((stats.recent_companies / stats.total_companies) * 100)}% of total
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
    total_companies: 0,
    active_companies: 0,
    inactive_companies: 0,
    recent_companies: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminDashboardAPI.getCompanyStatistics();
      if (response.success) {
        setStats(response.data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchStats();
    } catch (error) {
      console.error("Error refreshing admin stats:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
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

          <div className="dashboard-content">
            <CompanyStatsCard stats={stats} />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
