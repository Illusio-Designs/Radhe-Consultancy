import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminDashboardAPI } from "../../../services/api";
import {
  Package2,
  RefreshCcw,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  ShoppingCart,
  DollarSign,
  Briefcase,
  Shield,
  Truck,
  Flame,
  HeartPulse,
  HeartHandshake,
  User,
  UserCog,
  BookOpenCheck,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Car,
  ScanHeart,
  Key,
  FileKey,
  FileCheck,
  FileX
} from 'lucide-react';
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

const AllInsuranceCard = ({ stats }) => {
  // Provide fallback objects to prevent undefined errors
  const ecp = stats.ecp || { total: 0, recent: 0, percent: 0 };
  const vehicle = stats.vehicle || { total: 0, recent: 0, percent: 0 };
  const fire = stats.fire || { total: 0, recent: 0, percent: 0 };
  const health = stats.health || { total: 0, recent: 0, percent: 0 };
  const life = stats.life || { total: 0, recent: 0, percent: 0 };

  return (
    <div className="all-insurance-card">
      <div className="all-insurance-header">
        <Shield className="all-insurance-icon" />
        <h2>All Insurance Policies</h2>
      </div>
      <div className="all-insurance-stats">
        <div className="all-insurance-total">
          <span className="stat-label">Total</span>
          <span className="stat-value">{stats.all.total}</span>
        </div>
        <div className="all-insurance-recent">
          <span className="stat-label">Recent (30d)</span>
          <div className="stat-value-container">
            <span className="stat-value">{stats.all.recent}</span>
            <span className="stat-percentage">{stats.all.percent}%</span>
          </div>
        </div>
      </div>
      <div className="insurance-type-grid">
        <InsuranceTypeCard
          icon={<UserCog />}
          label="ECP"
          stats={ecp}
          color="#007bff"
        />
        <InsuranceTypeCard
          icon={<Car />}
          label="Vehicle"
          stats={vehicle}
          color="#28a745"
        />
        <InsuranceTypeCard
          icon={<Flame />}
          label="Fire"
          stats={fire}
          color="#e67e22"
        />
        <InsuranceTypeCard
          icon={<HeartPulse />}
          label="Health"
          stats={health}
          color="#dc3545"
        />
        <InsuranceTypeCard
          icon={<ScanHeart />}
          label="Life"
          stats={life}
          color="#8e44ad"
        />
      </div>
    </div>
  );
};

const CompanyStatsCard = ({ stats }) => (
  <div className="consumer-stats-card">
    <div className="consumer-stats-header">
      <div className="consumer-stats-title">
        <Package2 className="stats-icon" />
        <h2>Company Statistics</h2>
      </div>
    </div>

    <div className="consumer-stats-grid">
      <div className="consumer-stat-item total">
        <div className="stat-label">
          <Briefcase className="stat-icon" />
          Total Companies
        </div>
        <div className="stat-value">{stats.total_companies}</div>
      </div>

      <div className="consumer-stat-item active">
        <div className="stat-label">
          <CheckCircle2 className="stat-icon" />
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
          <XCircle className="stat-icon" />
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
          <Clock className="stat-icon" />
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
          <Users className="stats-icon" />
          <h2>Consumer Statistics</h2>
        </div>
      </div>
      <div className="consumer-stats-grid">
        <div className="consumer-stat-item total">
          <div className="stat-label">
            <Users className="stat-icon" />
            Total Consumers
          </div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="consumer-stat-item active">
          <div className="stat-label">
            <CheckCircle2 className="stat-icon" />
            Active Consumers
          </div>
          <div className="stat-value">{active}</div>
          <div className="stat-percentage">{percent_active}% of total</div>
        </div>
        <div className="consumer-stat-item completed">
          <div className="stat-label">
            <XCircle className="stat-icon" />
            Inactive Consumers
          </div>
          <div className="stat-value">{inactive}</div>
          <div className="stat-percentage">{percent_inactive}% of total</div>
        </div>
        <div className="consumer-stat-item spending">
          <div className="stat-label">
            <Clock className="stat-icon" />
            Recent Consumers (30 days)
          </div>
          <div className="stat-value">{recent}</div>
          <div className="stat-percentage">{percent_recent}% of total</div>
        </div>
      </div>
    </div>
  );
};

const DSCStatsCard = ({ stats }) => {
  if (!stats) return null;
  
  const {
    total = 0,
    in: inCount = 0,
    out: outCount = 0,
    recent = 0,
    percent_in = 0,
    percent_out = 0,
    percent_recent = 0
  } = stats;

  return (
    <div className="dsc-stats-card">
      <div className="dsc-stats-header">
        <div className="dsc-stats-title">
          <FileKey className="stats-icon" />
          <h2>Digital Signature Certificates</h2>
        </div>
      </div>
      <div className="dsc-stats-grid">
        <div className="dsc-stat-item total">
          <div className="stat-label">
            <Key className="stat-icon" />
            Total DSCs
          </div>
          <div className="stat-value">{total}</div>
        </div>

        <div className="dsc-stat-item active">
          <div className="stat-label">
            <FileCheck className="stat-icon" />
            IN DSCs
          </div>
          <div className="stat-value">{inCount}</div>
          <div className="stat-percentage">
            {percent_in}% of total
          </div>
        </div>

        <div className="dsc-stat-item inactive">
          <div className="stat-label">
            <FileX className="stat-icon" />
            OUT DSCs
          </div>
          <div className="stat-value">{outCount}</div>
          <div className="stat-percentage">
            {percent_out}% of total
          </div>
        </div>

        <div className="dsc-stat-item recent">
          <div className="stat-label">
            <Clock className="stat-icon" />
            Recent DSCs (30 days)
          </div>
          <div className="stat-value">{recent}</div>
          <div className="stat-percentage">
            {percent_recent}% of total
          </div>
        </div>
      </div>
    </div>
  );
};

// Map roles to icons and colors
const roleIconMap = {
  admin: { icon: <Shield />, color: "#007bff" },
  user_manager: { icon: <UserCog />, color: "#28a745" },
  vendor_manager: { icon: <Briefcase />, color: "#e67e22" },
  company: { icon: <Briefcase />, color: "#17a2b8" },
  consumer: { icon: <Users />, color: "#dc3545" },
  user: { icon: <User />, color: "#6c757d" },
  // Add more roles as needed
};

const UserRoleStatsCard = ({ stats }) => (
  <div
    className="insurance-type-card user-role-stats-card"
    style={{ borderTop: `4px solid #007bff` }}
  >
    <div className="insurance-type-header">
      <span className="insurance-type-icon" style={{ color: "#007bff" }}>
        <Users />
      </span>
      <span className="insurance-type-label">User Role Statistics</span>
    </div>
    <div className="user-role-stats-grid">
      {Object.entries(stats).map(([role, count]) => {
        const { icon, color } = roleIconMap[role] || {
          icon: <User />,
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
          <Clock className="meta-icon" /> Last updated: {lastUpdated}
        </span>
        <button
          className={`refresh-button ${isLoading ? "refreshing" : ""}`}
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCcw className="refresh-icon" />
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
    <div className="date-filter">
      <CalendarDays className="filter-icon" />
      <select value={timeFilter} onChange={onFilterChange}>
        <option value="7days">Last 7 days</option>
        <option value="30days">Last 30 days</option>
        <option value="90days">Last 3 months</option>
      </select>
    </div>
  </div>
);

const CombinedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total_companies: 0,
    active_companies: 0,
    inactive_companies: 0,
    recent_companies: 0,
    consumer_stats: { total: 0, recent: 0, percent: 0 },
    dsc_stats: {
      total: 0,
      in: 0,
      out: 0,
      recent: 0
    },
    insurance_stats: {
      all: { total: 0, recent: 0, percent: 0 },
      ecp: { total: 0, recent: 0, percent: 0 },
      vehicle: { total: 0, recent: 0, percent: 0 },
      fire: { total: 0, recent: 0, percent: 0 },
      marine: { total: 0, recent: 0, percent: 0 },
      health: { total: 0, recent: 0, percent: 0 },
      life: { total: 0, recent: 0, percent: 0 },
    },
    user_role_stats: {},
  });
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
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchStats();
    } catch (error) {
      console.error("Error refreshing admin stats:", error);
    } finally {
      setIsLoading(false);
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

  // Get all user roles as lowercase
  const userRoles = user?.roles?.map(r => r.toLowerCase()) || [];
  const showAdmin = userRoles.includes('admin');
  const showInsurance = userRoles.includes('insurance_manager');
  const showDSC = userRoles.includes('dsc_manager');
  const showCompany = userRoles.includes('company');
  const showConsumer = userRoles.includes('consumer');
  const showVendorManager = userRoles.includes('vendor_manager');
  const showUserManager = userRoles.includes('user_manager');

  // Unified dashboard layout for all users
  return (
    <div className="dashboard-page">
      <DashboardHeader
        title="Dashboard"
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        timeFilter={timeFilter}
        onFilterChange={handleFilterChange}
      />
      <div className="dashboard-content">
        <div className="dashboard-grid">
          {(showAdmin || showCompany) && <CompanyStatsCard stats={stats} />}
          {(showAdmin || showConsumer) && <ConsumerStatsCard stats={stats.consumer_stats} />}
          {(showAdmin || showInsurance) && <AllInsuranceCard stats={stats.insurance_stats} />}
          {(showAdmin || showDSC) && <DSCStatsCard stats={stats.dsc_stats} />}
          {(showAdmin || showVendorManager) && <CompanyStatsCard stats={stats} />}
          {(showAdmin || showUserManager) && <UserRoleStatsCard stats={stats.user_role_stats || {}} />}
        </div>
      </div>
    </div>
  );
};

export default CombinedDashboard;
