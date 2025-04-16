import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/dashboard/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalConsumers: 0,
    activeCompanies: 0,
    activeConsumers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Companies</h3>
          <p>{stats.totalCompanies}</p>
        </div>
        <div className="stat-card">
          <h3>Total Consumers</h3>
          <p>{stats.totalConsumers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Companies</h3>
          <p>{stats.activeCompanies}</p>
        </div>
        <div className="stat-card">
          <h3>Active Consumers</h3>
          <p>{stats.activeConsumers}</p>
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