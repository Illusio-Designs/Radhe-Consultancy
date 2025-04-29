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
  FiClock as FiRecent,
  FiUsers,
  FiShoppingCart,
  FiDollarSign
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

const ConsumerStatsCard = () => {
  // Static data for consumer stats
  const consumerStats = {
    total_orders: 150,
    active_orders: 45,
    completed_orders: 105,
    total_spent: 12500,
    average_order_value: 83.33,
    favorite_categories: ["Electronics", "Clothing", "Home & Kitchen"]
  };

  return (
    <div className="consumer-stats-card">
      <div className="consumer-stats-header">
        <div className="consumer-stats-title">
          <FiUsers className="stats-icon" />
          <h2>Consumer Statistics</h2>
        </div>
      </div>
      
      <div className="consumer-stats-grid">
        <div className="consumer-stat-item total">
          <div className="stat-label">
            <FiShoppingCart className="stat-icon" />
            Total Orders
          </div>
          <div className="stat-value">{consumerStats.total_orders}</div>
        </div>

        <div className="consumer-stat-item active">
          <div className="stat-label">
            <FiClock className="stat-icon" />
            Active Orders
          </div>
          <div className="stat-value">{consumerStats.active_orders}</div>
          <div className="stat-percentage">
            {Math.round((consumerStats.active_orders / consumerStats.total_orders) * 100)}% of total
          </div>
        </div>

        <div className="consumer-stat-item completed">
          <div className="stat-label">
            <FiCheckCircle className="stat-icon" />
            Completed Orders
          </div>
          <div className="stat-value">{consumerStats.completed_orders}</div>
          <div className="stat-percentage">
            {Math.round((consumerStats.completed_orders / consumerStats.total_orders) * 100)}% of total
          </div>
        </div>

        <div className="consumer-stat-item spending">
          <div className="stat-label">
            <FiDollarSign className="stat-icon" />
            Total Spent
          </div>
          <div className="stat-value">₹{consumerStats.total_spent.toLocaleString()}</div>
          <div className="stat-percentage">
            Avg. ₹{consumerStats.average_order_value.toFixed(2)} per order
          </div>
        </div>
      </div>
    </div>
  );
};

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
            <ConsumerStatsCard />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
