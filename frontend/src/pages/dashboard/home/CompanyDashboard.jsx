import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get('/api/company/profile');
        setCompanyData(response.data);
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/company/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching company stats:', error);
      }
    };

    fetchCompanyData();
    fetchStats();
  }, []);

  return (
    <div className="company-dashboard">
      <h1>Company Dashboard</h1>
      
      {companyData && (
        <div className="company-profile">
          <h2>Company Profile</h2>
          <div className="profile-details">
            <p><strong>Company Name:</strong> {companyData.company_name}</p>
            <p><strong>Owner:</strong> {companyData.owner_name}</p>
            <p><strong>Email:</strong> {companyData.company_email}</p>
            <p><strong>Contact:</strong> {companyData.contact_number}</p>
            <p><strong>Address:</strong> {companyData.company_address}</p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="company-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => window.location.href = '/company/products'}>
            Manage Products
          </button>
          <button onClick={() => window.location.href = '/company/orders'}>
            View Orders
          </button>
          <button onClick={() => window.location.href = '/company/profile'}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard; 