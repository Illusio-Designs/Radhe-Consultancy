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
      <div className={`stat-change ${change >= 0 ? "positive" : "negative"}`}>
        {change >= 0 ? "+" : ""}
        {change}%<span className="stat-change-indicator"></span>
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
      setIsLoading(false);
    }
  };

  const adminStats = [
    {
      id: 1,
      title: "Total Companies",
      value: stats.totalCompanies,
      change: 12.5,
      icon: FiPackage,
    },
    {
      id: 2,
      title: "Total Consumers",
      value: stats.totalConsumers,
      change: 8.2,
      icon: FiUsers,
    },
    {
      id: 3,
      title: "Active Companies",
      value: stats.activeCompanies,
      change: -2.4,
      icon: FiTarget,
    },
    {
      id: 4,
      title: "Active Consumers",
      value: stats.activeConsumers,
      change: 15.3,
      icon: FiHome,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      text: "New company registered: XYZ Corp",
      time: "2 hours ago",
      user: "System",
      type: "registration",
    },
    {
      id: 2,
      text: "Consumer profile updated",
      time: "4 hours ago",
      user: "Admin",
      type: "update",
    },
    {
      id: 3,
      text: "System maintenance completed",
      time: "6 hours ago",
      user: "System",
      type: "system",
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      text: "Review new company applications",
      date: "Today, 2:00 PM",
      priority: "high",
    },
    {
      id: 2,
      text: "Monthly user activity report",
      date: "Tomorrow, 5:00 PM",
      priority: "medium",
    },
    {
      id: 3,
      text: "System backup",
      date: "Wed, 11:00 AM",
      priority: "low",
    },
  ];

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

  return (
    <div className="dashboard-page">
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
            change={stat.change}
          />
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card activities-card">
          <div className="card-header">
            <h2>Recent Activities</h2>
            <span className="card-count">
              {recentActivities.length} activities
            </span>
          </div>
          <ul className="activity-list">
            {recentActivities.map((activity) => (
              <li
                key={activity.id}
                className={`activity-item activity-${activity.type}`}
              >
                <div className="activity-content">
                  <span className="activity-text">{activity.text}</span>
                  <div className="activity-meta">
                    <span className="activity-user">{activity.user}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card tasks-card">
          <div className="card-header">
            <h2>Upcoming Tasks</h2>
            <span className="card-count">{upcomingTasks.length} tasks</span>
          </div>
          <ul className="task-list">
            {upcomingTasks.map((task) => (
              <li
                key={task.id}
                className={`task-item priority-${task.priority}`}
              >
                <div className="task-content">
                  <span className="task-text">{task.text}</span>
                  <div className="task-meta">
                    <span className="task-priority">{task.priority}</span>
                    <span className="task-date">{task.date}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/dashboard/companies" className="action-button">
            Manage Companies
          </Link>
          <Link to="/dashboard/consumers" className="action-button">
            Manage Consumers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
