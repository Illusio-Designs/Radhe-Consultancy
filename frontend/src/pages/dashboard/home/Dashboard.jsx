import React from 'react';
import { FiUsers, FiPackage, FiHome, FiTarget } from 'react-icons/fi';
import '../../../styles/dashboard/Dashboard.css';

const StatCard = ({ icon: Icon, title, value, change }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-primary-50 rounded-full">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3>{title}</h3>
          <div className="stat-value">{value}</div>
        </div>
      </div>
      <div className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
        {change >= 0 ? '+' : ''}{change}%
      </div>
    </div>
  </div>
);

function Dashboard() {
  const stats = [
    { id: 1, title: 'Total Users', value: '2,845', change: 12.5, icon: FiUsers },
    { id: 2, title: 'Active Projects', value: '45', change: 8.2, icon: FiPackage },
    { id: 3, title: 'Total Revenue', value: '$89,242', change: -2.4, icon: FiTarget },
    { id: 4, title: 'New Clients', value: '124', change: 15.3, icon: FiHome },
  ];

  const recentActivities = [
    { id: 1, text: 'John Doe completed Project A', time: '2 hours ago' },
    { id: 2, text: 'New client onboarded: XYZ Corp', time: '4 hours ago' },
    { id: 3, text: 'System maintenance completed', time: '6 hours ago' },
  ];

  const upcomingTasks = [
    { id: 1, text: 'Client meeting with ABC Inc', date: 'Today, 2:00 PM' },
    { id: 2, text: 'Project deadline: Website Redesign', date: 'Tomorrow, 5:00 PM' },
    { id: 3, text: 'Team review meeting', date: 'Wed, 11:00 AM' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div className="date-filter">
          <select>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
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
        <div className="dashboard-card">
          <h2>Recent Activities</h2>
          <ul className="activity-list">
            {recentActivities.map((activity) => (
              <li key={activity.id}>
                <span className="activity-text">{activity.text}</span>
                <span className="activity-time">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <h2>Upcoming Tasks</h2>
          <ul className="task-list">
            {upcomingTasks.map((task) => (
              <li key={task.id}>
                <span className="activity-text">{task.text}</span>
                <span className="task-date">{task.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;