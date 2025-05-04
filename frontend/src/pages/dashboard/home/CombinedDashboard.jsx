import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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
  FiDollarSign,
  FiBriefcase,
  FiShield,
  FiTruck,
  FiZap,
  FiAnchor,
  FiHeart,
  FiUser,
  FiUserCheck,
  FiUserX,
  FiUserPlus,
} from "react-icons/fi";
import { adminDashboardAPI, userAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";

const InsuranceTypeCard = ({ icon, label, stats, color }) => (
  <div
    className="insurance-type-card"
    style={{ borderTop: `4px solid ${color}` }}
  >
    <div className="insurance-type-header">
      <span className="insurance-type-icon" style={{ color }}>
        {icon}
      </span>
      <span className="insurance-type-label">{label}</span>
    </div>
    <div className="insurance-type-stats">
      <div className="insurance-type-total">
        <span className="stat-label">Total</span>
        <span className="stat-value">{stats.total}</span>
      </div>
      <div className="insurance-type-recent">
        <span className="stat-label">Recent (30d)</span>
        <div className="stat-value-container">
          <span className="stat-value">{stats.recent}</span>
          <span className="stat-percentage">{stats.percent}%</span>
        </div>
      </div>
    </div>
  </div>
);

const AllInsuranceCard = ({ stats }) => (
  <div className="all-insurance-card">
    <div className="all-insurance-header">
      <FiPackage className="all-insurance-icon" />
      <h2>All Insurance Policies</h2>
    </div>
    <div className="all-insurance-stats">
      <div className="all-insurance-total">
        <span className="stat-label">Total</span>
        <span className="stat-value">1000</span>
      </div>
      <div className="all-insurance-recent">
        <span className="stat-label">Recent (30d)</span>
        <div className="stat-value-container">
          <span className="stat-value">500</span>
          <span className="stat-percentage">50%</span>
        </div>
      </div>
    </div>
    <div className="insurance-type-grid">
      <InsuranceTypeCard
        icon={<FiShield />}
        label="ECP"
        stats={stats.ecp}
        color="#007bff"
      />
      <InsuranceTypeCard
        icon={<FiTruck />}
        label="Vehicle"
        stats={stats.vehicle}
        color="#28a745"
      />
      <InsuranceTypeCard
        icon={<FiZap />}
        label="Fire"
        stats={stats.fire}
        color="#e67e22"
      />
      <InsuranceTypeCard
        icon={<FiAnchor />}
        label="Marine"
        stats={stats.marine}
        color="#17a2b8"
      />
      <InsuranceTypeCard
        icon={<FiHeart />}
        label="Health"
        stats={stats.health}
        color="#dc3545"
      />
    </div>
  </div>
);

const CompanyStatsCard = ({ stats }) => (
  <div className="consumer-stats-card">
    <div className="consumer-stats-header">
      <div className="consumer-stats-title">
        <FiPackage className="stats-icon" />
        <h2>Company Statistics</h2>
      </div>
    </div>

    <div className="consumer-stats-grid">
      <div className="consumer-stat-item total">
        <div className="stat-label">
          <FiBriefcase className="stat-icon" />
          Total Companies
        </div>
        <div className="stat-value">{stats.total_companies}</div>
      </div>

      <div className="consumer-stat-item active">
        <div className="stat-label">
          <FiCheckCircle className="stat-icon" />
          Active Companies
        </div>
        <div className="stat-value">{stats.active_companies}</div>
        <div className="stat-percentage">
          {Math.round((stats.active_companies / stats.total_companies) * 100)}%
          of total
        </div>
      </div>

      <div className="consumer-stat-item completed">
        <div className="stat-label">
          <FiXCircle className="stat-icon" />
          Inactive Companies
        </div>
        <div className="stat-value">{stats.inactive_companies}</div>
        <div className="stat-percentage">
          {Math.round((stats.inactive_companies / stats.total_companies) * 100)}
          % of total
        </div>
      </div>

      <div className="consumer-stat-item spending">
        <div className="stat-label">
          <FiRecent className="stat-icon" />
          Recent Companies (30 days)
        </div>
        <div className="stat-value">{stats.recent_companies}</div>
        <div className="stat-percentage">
          {Math.round((stats.recent_companies / stats.total_companies) * 100)}%
          of total
        </div>
      </div>
    </div>
  </div>
);

const ConsumerStatsCard = ({ stats }) => {
  if (!stats) return null;
  const {
    total = 0,
    active = 0,
    inactive = 0,
    recent = 0,
    percent_active = 0,
    percent_inactive = 0,
    percent_recent = 0,
  } = stats;

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
            <FiUsers className="stat-icon" />
            Total Consumers
          </div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="consumer-stat-item active">
          <div className="stat-label">
            <FiCheckCircle className="stat-icon" />
            Active Consumers
          </div>
          <div className="stat-value">{active}</div>
          <div className="stat-percentage">{percent_active}% of total</div>
        </div>
        <div className="consumer-stat-item completed">
          <div className="stat-label">
            <FiXCircle className="stat-icon" />
            Inactive Consumers
          </div>
          <div className="stat-value">{inactive}</div>
          <div className="stat-percentage">{percent_inactive}% of total</div>
        </div>
        <div className="consumer-stat-item spending">
          <div className="stat-label">
            <FiClock className="stat-icon" />
            Recent Consumers (30 days)
          </div>
          <div className="stat-value">{recent}</div>
          <div className="stat-percentage">{percent_recent}% of total</div>
        </div>
      </div>
    </div>
  );
};

// Map roles to icons and colors
const roleIconMap = {
  admin: { icon: <FiShield />, color: "#007bff" },
  user_manager: { icon: <FiUserCheck />, color: "#28a745" },
  vendor_manager: { icon: <FiBriefcase />, color: "#e67e22" },
  company: { icon: <FiBriefcase />, color: "#17a2b8" },
  consumer: { icon: <FiUsers />, color: "#dc3545" },
  user: { icon: <FiUser />, color: "#6c757d" },
  // Add more roles as needed
};

const UserRoleStatsCard = ({ stats }) => (
  <div
    className="insurance-type-card user-role-stats-card"
    style={{ borderTop: `4px solid #007bff` }}
  >
    <div className="insurance-type-header">
      <span className="insurance-type-icon" style={{ color: "#007bff" }}>
        <FiUsers />
      </span>
      <span className="insurance-type-label">User Role Statistics</span>
    </div>
    <div className="user-role-stats-grid">
      {Object.entries(stats).map(([role, count]) => {
        const { icon, color } = roleIconMap[role] || {
          icon: <FiUser />,
          color: "#6c757d",
        };
        return (
          <div
            key={role}
            className="user-role-stat-item"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <span className="user-role-icon" style={{ color }}>
              {icon}
            </span>
            <span className="user-role-label">
              {role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
            <span className="user-role-count">{count}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const DashboardHeader = ({
  title,
  lastUpdated,
  isLoading,
  onRefresh,
  timeFilter,
  onFilterChange,
}) => (
  <div className="dashboard-header">
    <div className="dashboard-title-area">
      <h1>{title}</h1>
      <div className="dashboard-meta">
        <span className="last-updated">
          <FiClock className="meta-icon" /> Last updated: {lastUpdated}
        </span>
        <button
          className={`refresh-button ${isLoading ? "refreshing" : ""}`}
          onClick={onRefresh}
          disabled={isLoading}
        >
          <FiRefreshCw className="refresh-icon" />
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
    <div className="date-filter">
      <FiCalendar className="filter-icon" />
      <select value={timeFilter} onChange={onFilterChange}>
        <option value="7days">Last 7 days</option>
        <option value="30days">Last 30 days</option>
        <option value="90days">Last 3 months</option>
      </select>
    </div>
  </div>
);

const AdminDashboard = ({ stats, isLoading, lastUpdated, fetchStats }) => {
  const [timeFilter, setTimeFilter] = useState("7days");

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
            <div className="dashboard-grid">
              <CompanyStatsCard stats={stats} />
              <ConsumerStatsCard stats={stats.consumer_stats} />
            </div>
            <AllInsuranceCard stats={stats.insurance_stats} />
          </div>
        </>
      )}
    </div>
  );
};

const CombinedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_companies: 0,
    active_companies: 0,
    inactive_companies: 0,
    recent_companies: 0,
    consumer_stats: { total: 0, recent: 0, percent: 0 },
    insurance_stats: {
      all: { total: 0, recent: 0, percent: 0 },
      ecp: { total: 0, recent: 0, percent: 0 },
      vehicle: { total: 0, recent: 0, percent: 0 },
      fire: { total: 0, recent: 0, percent: 0 },
      marine: { total: 0, recent: 0, percent: 0 },
      health: { total: 0, recent: 0, percent: 0 },
    },
    user_role_stats: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleTimeString()
  );
  const [timeFilter, setTimeFilter] = useState("7days");

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

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const renderDashboardContent = () => {
    const userRole = user?.role_name || user?.role;
    switch (userRole) {
      case "admin":
        return (
          <AdminDashboard
            stats={stats}
            isLoading={isLoading}
            lastUpdated={lastUpdated}
            fetchStats={fetchStats}
          />
        );
      case "company":
        return (
          <div className="dashboard-page">
            <DashboardHeader
              title="Company Dashboard"
              lastUpdated={lastUpdated}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              timeFilter={timeFilter}
              onFilterChange={handleFilterChange}
            />
            <div className="dashboard-content">
              <div className="dashboard-grid">
                <CompanyStatsCard stats={stats} />
                <ConsumerStatsCard stats={stats.consumer_stats} />
              </div>
            </div>
          </div>
        );
      case "consumer":
        return (
          <div className="dashboard-page">
            <DashboardHeader
              title="Consumer Dashboard"
              lastUpdated={lastUpdated}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              timeFilter={timeFilter}
              onFilterChange={handleFilterChange}
            />
            <div className="dashboard-content">
              <div className="dashboard-grid">
                <CompanyStatsCard stats={stats} />
                <ConsumerStatsCard stats={stats.consumer_stats} />
              </div>
            </div>
          </div>
        );
      case "vendor_manager":
        // Vendor manager: Only show company and consumer stats, no insurance
        return (
          <div className="dashboard-page">
            <DashboardHeader
              title="Vendor Manager Dashboard"
              lastUpdated={lastUpdated}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              timeFilter={timeFilter}
              onFilterChange={handleFilterChange}
            />
            <div className="dashboard-content">
              <div className="dashboard-grid">
                <CompanyStatsCard stats={stats} />
                <ConsumerStatsCard stats={stats.consumer_stats} />
              </div>
            </div>
          </div>
        );
      case "user_manager":
        return (
          <div className="dashboard-page">
            <DashboardHeader
              title="User Manager Dashboard"
              lastUpdated={lastUpdated}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              timeFilter={timeFilter}
              onFilterChange={handleFilterChange}
            />
            <div className="dashboard-content">
              <UserRoleStatsCard stats={stats.user_role_stats || {}} />
            </div>
          </div>
        );
      case "insurance_manager":
        return (
          <div className="dashboard-page">
            <DashboardHeader
              title="Insurance Manager Dashboard"
              lastUpdated={lastUpdated}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              timeFilter={timeFilter}
              onFilterChange={handleFilterChange}
            />
            <div className="dashboard-content">
              <AllInsuranceCard stats={stats.insurance_stats} />
            </div>
          </div>
        );
      default:
        return (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <p>Invalid role or access denied</p>
          </div>
        );
    }
  };

  return renderDashboardContent();
};

export default CombinedDashboard;
