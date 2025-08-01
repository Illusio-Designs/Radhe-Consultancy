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
  FileX,
  Factory,
  ClipboardList,
  TrendingUp,
  Weight,
  Zap
} from 'lucide-react';
import Loader from "../../../components/common/Loader/Loader";
import PieChart from "../../../components/charts/PieChart";
import BarChart from "../../../components/charts/BarChart";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";
import "../../../styles/components/charts/Charts.css";

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
  <div className="stats-card">
    <div className="stats-card-header">
      <Users className="stats-card-icon" />
      <h3>User Role Distribution</h3>
    </div>
    <div className="stats-card-content">
      {Object.entries(stats).map(([role, count]) => (
        <div key={role} className="role-stat">
          <span className="role-name">{role}</span>
          <span className="role-count">{count}</span>
          </div>
      ))}
    </div>
  </div>
);

// Factory Quotation Chart Component
const FactoryQuotationChart = ({ stats }) => {
  // If no stats or no status_stats, show empty chart with message
  if (!stats || !stats.status_stats || Object.keys(stats.status_stats).length === 0) {
    const emptyData = {
      labels: ['No Data'],
      datasets: [{
        data: [1],
        backgroundColor: ['#6c757d'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    return (
      <PieChart
        data={emptyData}
        title="Factory Quotation Status Distribution"
        height={350}
        width={400}
      />
    );
  }

  const statusData = {
    labels: Object.keys(stats.status_stats).map(status => 
      status.charAt(0).toUpperCase() + status.slice(1)
    ),
    datasets: [{
      data: Object.values(stats.status_stats),
      backgroundColor: [
        '#007bff', // Blue for pending
        '#28a745', // Green for approved
        '#ffc107', // Yellow for plan
        '#17a2b8', // Cyan for stability
        '#6f42c1', // Purple for application
        '#fd7e14', // Orange for renewal
        '#dc3545', // Red for rejected
        '#6c757d'  // Gray for others
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  return (
    <PieChart
      data={statusData}
      title="Factory Quotation Status Distribution"
      height={350}
      width={400}
    />
  );
};

// Plan Management Chart Component
const PlanManagementChart = ({ stats }) => {
  // If no stats or no status_stats, show empty chart with message
  if (!stats || !stats.status_stats || Object.keys(stats.status_stats).length === 0) {
    const emptyData = {
      labels: ['No Data'],
      datasets: [{
        data: [1],
        backgroundColor: ['#6c757d'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    return (
      <PieChart
        data={emptyData}
        title="Plan Management Status Distribution"
        height={350}
        width={400}
      />
    );
  }

  const statusData = {
    labels: Object.keys(stats.status_stats).map(status => 
      status.charAt(0).toUpperCase() + status.slice(1)
    ),
    datasets: [{
      data: Object.values(stats.status_stats),
      backgroundColor: [
        '#ffc107', // Yellow for plan
        '#17a2b8', // Cyan for submit
        '#28a745', // Green for approved
        '#dc3545'  // Red for reject
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  return (
    <PieChart
      data={statusData}
      title="Plan Management Status Distribution"
      height={350}
      width={400}
    />
  );
};

// Stability Management Chart Component
const StabilityManagementChart = ({ stats }) => {
  // If no stats or no status_stats, show empty chart with message
  if (!stats || !stats.status_stats || Object.keys(stats.status_stats).length === 0) {
    const emptyData = {
      labels: ['No Data'],
      datasets: [{
        data: [1],
        backgroundColor: ['#6c757d'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    return (
      <PieChart
        data={emptyData}
        title="Stability Management Status Distribution"
        height={350}
        width={400}
      />
    );
  }

  const statusData = {
    labels: Object.keys(stats.status_stats).map(status => 
      status.charAt(0).toUpperCase() + status.slice(1)
    ),
    datasets: [{
      data: Object.values(stats.status_stats),
      backgroundColor: [
        '#ffc107', // Yellow for stability
        '#17a2b8', // Cyan for submit
        '#28a745', // Green for approved
        '#dc3545'  // Red for reject
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  return (
    <PieChart
      data={statusData}
      title="Stability Management Status Distribution"
      height={350}
      width={400}
    />
  );
};

// Plan Manager Status Cards Component
const PlanManagerStatusCards = ({ stats }) => {
  if (!stats) return null;

  const statusStats = stats.status_stats || {};
  const totalPlans = stats.total || 0;
  const recentPlans = stats.recent || 0;
  const percentRecent = stats.percent_recent || 0;

  // Create chart data for plan manager
  const chartData = {
    labels: Object.keys(statusStats).map(status => 
      status.charAt(0).toUpperCase() + status.slice(1)
    ),
    datasets: [{
      data: Object.values(statusStats),
      backgroundColor: [
        '#ffc107', // Yellow for plan
        '#17a2b8', // Cyan for submit
        '#28a745', // Green for approved
        '#dc3545'  // Red for reject
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  return (
    <div className="status-cards-section">
      <h2 className="section-title">Plan Management Overview</h2>
      
      {/* Status Cards */}
      <div className="status-cards-grid">
        <div className="status-card" style={{ borderTop: '4px solid #007bff' }}>
          <div className="status-card-header">
            <ClipboardList className="status-card-icon" style={{ color: '#007bff' }} />
            <span className="status-card-label">Total Plans</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{totalPlans}</div>
          </div>
        </div>
        
        <div className="status-card" style={{ borderTop: '4px solid #28a745' }}>
          <div className="status-card-header">
            <TrendingUp className="status-card-icon" style={{ color: '#28a745' }} />
            <span className="status-card-label">Recent Plans (30d)</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{recentPlans}</div>
            <div className="status-card-percentage">
              <span className="percentage-value">{percentRecent}%</span>
              <span className="percentage-label">of total</span>
            </div>
          </div>
        </div>

        <div className="status-card" style={{ borderTop: '4px solid #ffc107' }}>
          <div className="status-card-header">
            <Clock className="status-card-icon" style={{ color: '#ffc107' }} />
            <span className="status-card-label">Assigned (Plan)</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{statusStats.plan || 0}</div>
          </div>
        </div>

        <div className="status-card" style={{ borderTop: '4px solid #17a2b8' }}>
          <div className="status-card-header">
            <FileCheck className="status-card-icon" style={{ color: '#17a2b8' }} />
            <span className="status-card-label">Submitted</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{statusStats.submit || 0}</div>
          </div>
        </div>

        <div className="status-card" style={{ borderTop: '4px solid #28a745' }}>
          <div className="status-card-header">
            <CheckCircle2 className="status-card-icon" style={{ color: '#28a745' }} />
            <span className="status-card-label">Approved</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{statusStats.Approved || 0}</div>
          </div>
        </div>

        <div className="status-card" style={{ borderTop: '4px solid #dc3545' }}>
          <div className="status-card-header">
            <XCircle className="status-card-icon" style={{ color: '#dc3545' }} />
            <span className="status-card-label">Rejected</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{statusStats.Reject || 0}</div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="charts-section">
        <h3 className="charts-section-title">Status Distribution</h3>
        <div className="charts-grid">
          <PieChart
            data={chartData}
            title="My Plan Status Distribution"
            height={350}
            width={400}
          />
        </div>
      </div>
    </div>
  );
};

// Stability Manager Status Cards Component
const StabilityManagerStatusCards = ({ stats }) => {
  if (!stats) return null;

  const statusStats = stats.status_stats || {};
  const loadTypeStats = stats.load_type_stats || {};
  const totalStability = stats.total || 0;
  const recentStability = stats.recent || 0;
  const percentRecent = stats.percent_recent || 0;

  // Create chart data for stability manager
  const statusChartData = {
    labels: Object.keys(statusStats).map(status => 
      status.charAt(0).toUpperCase() + status.slice(1)
    ),
    datasets: [{
      data: Object.values(statusStats),
      backgroundColor: [
        '#ffc107', // Yellow for stability
        '#17a2b8', // Cyan for submit
        '#28a745', // Green for approved
        '#dc3545'  // Red for reject
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // Create chart data for load type
  const loadTypeChartData = {
    labels: Object.keys(loadTypeStats).map(loadType => 
      loadType.replace('_', ' ').charAt(0).toUpperCase() + loadType.replace('_', ' ').slice(1)
    ),
    datasets: [{
      data: Object.values(loadTypeStats),
      backgroundColor: [
        '#6f42c1', // Purple for with load
        '#fd7e14'  // Orange for without load
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  return (
    <div className="status-cards-section">
      <h2 className="section-title">Stability Management Overview</h2>
      
      {/* Status Cards */}
      <div className="status-cards-grid">
        <div className="status-card" style={{ borderTop: '4px solid #007bff' }}>
          <div className="status-card-header">
            <ClipboardList className="status-card-icon" style={{ color: '#007bff' }} />
            <span className="status-card-label">Total Stability Records</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{totalStability}</div>
          </div>
        </div>
        
        <div className="status-card" style={{ borderTop: '4px solid #28a745' }}>
          <div className="status-card-header">
            <TrendingUp className="status-card-icon" style={{ color: '#28a745' }} />
            <span className="status-card-label">Recent Records (30d)</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{recentStability}</div>
            <div className="status-card-percentage">
              <span className="percentage-value">{percentRecent}%</span>
              <span className="percentage-label">of total</span>
            </div>
          </div>
        </div>

        <div className="status-card" style={{ borderTop: '4px solid #ffc107' }}>
          <div className="status-card-header">
            <Clock className="status-card-icon" style={{ color: '#ffc107' }} />
            <span className="status-card-label">Assigned (Stability)</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{statusStats.stability || 0}</div>
          </div>
        </div>

        <div className="status-card" style={{ borderTop: '4px solid #17a2b8' }}>
          <div className="status-card-header">
            <FileCheck className="status-card-icon" style={{ color: '#17a2b8' }} />
            <span className="status-card-label">Submitted</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{statusStats.submit || 0}</div>
          </div>
        </div>

        <div className="status-card" style={{ borderTop: '4px solid #28a745' }}>
          <div className="status-card-header">
            <CheckCircle2 className="status-card-icon" style={{ color: '#28a745' }} />
            <span className="status-card-label">Approved</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{statusStats.Approved || 0}</div>
          </div>
        </div>

        <div className="status-card" style={{ borderTop: '4px solid #dc3545' }}>
          <div className="status-card-header">
            <XCircle className="status-card-icon" style={{ color: '#dc3545' }} />
            <span className="status-card-label">Rejected</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{statusStats.Reject || 0}</div>
          </div>
        </div>

        <div className="status-card" style={{ borderTop: '4px solid #6f42c1' }}>
          <div className="status-card-header">
            <Weight className="status-card-icon" style={{ color: '#6f42c1' }} />
            <span className="status-card-label">With Load</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{loadTypeStats.with_load || 0}</div>
          </div>
        </div>

        <div className="status-card" style={{ borderTop: '4px solid #fd7e14' }}>
          <div className="status-card-header">
            <Zap className="status-card-icon" style={{ color: '#fd7e14' }} />
            <span className="status-card-label">Without Load</span>
          </div>
          <div className="status-card-content">
            <div className="status-card-count">{loadTypeStats.without_load || 0}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <h3 className="charts-section-title">Status Distribution</h3>
        <div className="charts-grid">
          <PieChart
            data={statusChartData}
            title="My Stability Status Distribution"
            height={350}
            width={400}
          />
          <PieChart
            data={loadTypeChartData}
            title="Load Type Distribution"
            height={350}
            width={400}
          />
        </div>
      </div>
    </div>
  );
};

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
  const { user, userRoles } = useAuth();
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
    // New statistics for compliance management
    factory_quotation_stats: {},
    plan_management_stats: {},
    stability_management_stats: {},
    plan_manager_stats: {},
    stability_manager_stats: {}
  });
  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleTimeString()
  );
  const [timeFilter, setTimeFilter] = useState("7days");

  useEffect(() => {
    fetchStats();
  }, [user, userRoles]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      let response;
      
      // Fetch role-specific statistics
      if (user && userRoles.includes("plan_manager")) {
        response = await adminDashboardAPI.getPlanManagerStats();
        if (response.success) {
          setStats(prev => ({ ...prev, plan_manager_stats: response.data }));
        }
      } else if (user && userRoles.includes("stability_manager")) {
        response = await adminDashboardAPI.getStabilityManagerStats();
        if (response.success) {
          setStats(prev => ({ ...prev, stability_manager_stats: response.data }));
        }
      } else if (user && userRoles.includes("company") && (user.profile?.company_id || user.company?.company_id)) {
        const companyId = user.profile?.company_id || user.company?.company_id;
        response = await adminDashboardAPI.getCompanyStats(companyId);
        if (response.success) {
          setStats(prev => ({ ...prev, ...response.data }));
        }
      } else if (user && userRoles.includes("consumer") && (user.profile?.consumer_id || user.consumer?.consumer_id)) {
        const consumerId = user.profile?.consumer_id || user.consumer?.consumer_id;
        response = await adminDashboardAPI.getConsumerStats(consumerId);
        if (response.success) {
          setStats(prev => ({ ...prev, ...response.data }));
        }
      } else {
        // Admin or other roles - fetch all statistics from main endpoint
        response = await adminDashboardAPI.getCompanyStatistics();
        if (response.success) {
          setStats(prev => ({ 
            ...prev, 
            ...response.data,
            // Extract compliance management stats from the main response
            factory_quotation_stats: response.data.factory_quotation_stats || {},
            plan_management_stats: response.data.plan_management_stats || {},
            stability_management_stats: response.data.stability_management_stats || {}
          }));
        }
      }
      
        setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
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

  const isCompany = userRoles.includes("company");
  const isConsumer = userRoles.includes("consumer");
  const companyId = user?.profile?.company_id;
  const consumerId = user?.profile?.consumer_id;

  // Only show company/consumer's own stats
  const filteredStats = React.useMemo(() => {
    if (isCompany) {
      return {
        ...stats,
        // Optionally filter stats fields to only this company
        // e.g., filter policies, dscs, etc. if needed
      };
    }
    if (isConsumer) {
      return {
        ...stats,
        // Optionally filter stats fields to only this consumer
      };
    }
    return stats;
  }, [stats, isCompany, isConsumer, companyId, consumerId]);

  // Get all user roles as lowercase
  const showAdmin = userRoles.includes('admin');
  const showInsurance = userRoles.includes('insurance_manager');
  const showDSC = userRoles.includes('dsc_manager');
  const showCompany = userRoles.includes('company');
  const showConsumer = userRoles.includes('consumer');
  const showVendorManager = userRoles.includes('vendor_manager');
  const showUserManager = userRoles.includes('user_manager');
  const showPlanManager = userRoles.includes('plan_manager');
  const showStabilityManager = userRoles.includes('stability_manager');
  const showComplianceManager = userRoles.includes('compliance_manager');

  // If only company or only consumer role, show nothing
  const onlyCompanyOrConsumer =
    (userRoles.length === 1 && (showCompany || showConsumer)) ||
    (userRoles.length === 2 && showCompany && showConsumer);

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
        {/* Role-specific dashboards */}
        {showPlanManager && (
          <PlanManagerStatusCards stats={stats.plan_manager_stats} />
        )}
        
        {showStabilityManager && (
          <StabilityManagerStatusCards stats={stats.stability_manager_stats} />
        )}

        {/* Admin/Compliance Manager Charts */}
        {(showAdmin || showComplianceManager) && (
          <div className="charts-section">
            <h2 className="charts-section-title">Compliance Management Analytics</h2>
            <div className="charts-grid">
              <FactoryQuotationChart stats={stats.factory_quotation_stats} />
              <PlanManagementChart stats={stats.plan_management_stats} />
              <StabilityManagementChart stats={stats.stability_management_stats} />
            </div>
          </div>
        )}

        {/* Regular dashboard grid */}
        <div className="dashboard-grid">
          {((isCompany || isConsumer) && !showAdmin && !showUserManager && !showVendorManager) ? (
            <>
              <AllInsuranceCard stats={stats.insurance_stats || {}} />
              <DSCStatsCard stats={stats.dsc_stats || {}} />
            </>
          ) : (
            <>
              {!onlyCompanyOrConsumer && ((showAdmin || showCompany || showUserManager) && <CompanyStatsCard stats={filteredStats} />)}
              {!onlyCompanyOrConsumer && ((showAdmin || showConsumer || showUserManager) && <ConsumerStatsCard stats={filteredStats.consumer_stats} />)}
              {!onlyCompanyOrConsumer && ((showAdmin || showInsurance) && <AllInsuranceCard stats={filteredStats.insurance_stats} />)}
              {!onlyCompanyOrConsumer && ((showAdmin || showDSC) && <DSCStatsCard stats={filteredStats.dsc_stats} />)}
              {!onlyCompanyOrConsumer && (showAdmin && <UserRoleStatsCard stats={filteredStats.user_role_stats || {}} />)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombinedDashboard;
