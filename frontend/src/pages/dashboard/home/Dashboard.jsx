import React, { useState } from 'react';
import { FiUsers, FiPackage, FiHome, FiTarget, FiRefreshCw, FiCalendar, FiClock } from 'react-icons/fi';
import '../../../styles/dashboard/Dashboard.css';

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
      <div className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
        {change >= 0 ? '+' : ''}{change}%
        <span className="stat-change-indicator"></span>
      </div>
    </div>
  </div>
);

function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('7days');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  const stats = [
    { id: 1, title: 'Total Users', value: '2,845', change: 12.5, icon: FiUsers },
    { id: 2, title: 'Active Projects', value: '45', change: 8.2, icon: FiPackage },
    { id: 3, title: 'Total Revenue', value: '$89,242', change: -2.4, icon: FiTarget },
    { id: 4, title: 'New Clients', value: '124', change: 15.3, icon: FiHome },
  ];

  const recentActivities = [
    { id: 1, text: 'John Doe completed Project A', time: '2 hours ago', user: 'John Doe', type: 'completion' },
    { id: 2, text: 'New client onboarded: XYZ Corp', time: '4 hours ago', user: 'Admin', type: 'client' },
    { id: 3, text: 'System maintenance completed', time: '6 hours ago', user: 'System', type: 'system' },
    { id: 4, text: 'Sarah updated Project B documentation', time: '8 hours ago', user: 'Sarah', type: 'update' },
  ];

  const upcomingTasks = [
    { id: 1, text: 'Client meeting with ABC Inc', date: 'Today, 2:00 PM', priority: 'high' },
    { id: 2, text: 'Project deadline: Website Redesign', date: 'Tomorrow, 5:00 PM', priority: 'medium' },
    { id: 3, text: 'Team review meeting', date: 'Wed, 11:00 AM', priority: 'low' },
    { id: 4, text: 'Quarterly planning session', date: 'Fri, 10:00 AM', priority: 'medium' },
  ];
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 800);
  };

  const handleFilterChange = (e) => {
    setTimeFilter(e.target.value);
    handleRefresh();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>Dashboard Overview</h1>
          <div className="dashboard-meta">
            <span className="last-updated">
              <FiClock className="meta-icon" /> Last updated: {lastUpdated}
            </span>
            <button 
              className={`refresh-button ${isLoading ? 'refreshing' : ''}`} 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <FiRefreshCw className="refresh-icon" />
              {isLoading ? 'Refreshing...' : 'Refresh'}
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
        {stats.map((stat) => (
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
            <span className="card-count">{recentActivities.length} activities</span>
          </div>
          <ul className="activity-list">
            {recentActivities.map((activity) => (
              <li key={activity.id} className={`activity-item activity-${activity.type}`}>
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
              <li key={task.id} className={`task-item priority-${task.priority}`}>
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
    </div>
  );
}

export default Dashboard;