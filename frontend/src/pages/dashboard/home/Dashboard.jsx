import React, { useState, useEffect } from 'react';
import { FiUsers, FiBriefcase, FiTarget, FiRefreshCw, FiClock } from 'react-icons/fi';
import '../../../styles/dashboard/Dashboard.css';
import { userAPI } from '../../../services/api';
import { roleAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const StatCard = ({ icon: Icon, title, value, change }) => (
  <div className="stat-card">
    <div className="stat-card-content">
      <div className="stat-card-header">
        <div className="stat-icon-container">
          <Icon className="stat-icon" />
        </div>
        <div className="stat-info">
          <h3 className="stat-title">{title}</h3>
          <div className="stat-value">{value || '0'}</div>
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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [stats, setStats] = useState({
    companies: 0,
    consumers: 0,
    services: 0,
    activeServices: 0,
    views: 0
  });

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [users, roles] = await Promise.all([
        userAPI.getAllUsers(),
        roleAPI.getAllRoles()
      ]);

      const companyRole = roles.find(role => role.role_name === 'Company');
      const consumerRole = roles.find(role => role.role_name === 'Consumer');

      let statsData = {
        companies: 0,
        consumers: 0,
        services: 0,
        activeServices: 0,
        views: 0
      };

      if (user.role === 'admin') {
        // Admin sees counts of all companies and consumers
        statsData = {
          companies: users.filter(user => user.role_id === companyRole?.id).length,
          consumers: users.filter(user => user.role_id === consumerRole?.id).length,
          services: 0 // You can add actual services count here
        };
      } else if (user.role === 'company') {
        // Company sees their own stats
        statsData = {
          services: 0, // Company's active services
          consumers: 0, // Consumers using their services
          views: 0 // Profile views
        };
      } else if (user.role === 'consumer') {
        // Consumer sees available companies and services
        statsData = {
          companies: users.filter(user => user.role_id === companyRole?.id).length,
          services: 0, // Available services
          activeServices: 0 // Services they're using
        };
      }

      setStats(statsData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user.role]);

  const getStatsCards = () => {
    switch (user.role) {
      case 'admin':
        return [
          { 
            id: 1, 
            title: 'Total Companies', 
            value: stats.companies || 0, 
            change: 0,
            icon: FiBriefcase 
          },
          { 
            id: 2, 
            title: 'Total Consumers', 
            value: stats.consumers || 0, 
            change: 0,
            icon: FiUsers 
          },
          { 
            id: 3, 
            title: 'Total Services', 
            value: stats.services || 0, 
            change: 0,
            icon: FiTarget 
          }
        ];

      case 'company':
        return [
          { 
            id: 1, 
            title: 'Active Services', 
            value: stats.services || 0, 
            change: 0,
            icon: FiTarget 
          },
          { 
            id: 2, 
            title: 'Active Consumers', 
            value: stats.consumers || 0, 
            change: 0,
            icon: FiUsers 
          },
          { 
            id: 3, 
            title: 'Profile Views', 
            value: stats.views || 0, 
            change: 0,
            icon: FiBriefcase 
          }
        ];

      case 'consumer':
        return [
          { 
            id: 1, 
            title: 'Available Companies', 
            value: stats.companies || 0, 
            change: 0,
            icon: FiBriefcase 
          },
          { 
            id: 2, 
            title: 'Available Services', 
            value: stats.services || 0, 
            change: 0,
            icon: FiTarget 
          },
          { 
            id: 3, 
            title: 'Active Services', 
            value: stats.activeServices || 0, 
            change: 0,
            icon: FiUsers 
          }
        ];

      default:
        return [];
    }
  };

  const handleRefresh = async () => {
    await fetchStats();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>
            {user.role === 'admin' 
              ? 'Admin Dashboard' 
              : user.role === 'company'
              ? 'Company Dashboard'
              : 'Consumer Dashboard'
            }
          </h1>
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
      </div>

      <div className="stats-grid">
        {getStatsCards().map((stat) => (
          <StatCard
            key={stat.id}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;