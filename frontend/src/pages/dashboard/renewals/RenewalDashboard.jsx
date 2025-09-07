import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { renewalAPI } from '../../../services/api';
import '../../../styles/pages/dashboard/renewals/RenewalDashboard.css';

const RenewalDashboard = () => {
  const { user } = useAuth();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchLiveData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchLiveData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveData = async () => {
    try {
      setLoading(true);
      const response = await renewalAPI.getLiveData();
      if (response.success) {
        setLiveData(response.data);
        setLastUpdated(new Date(response.data.lastUpdated));
        setError(null);
      } else {
        setError('Failed to fetch renewal data');
      }
    } catch (err) {
      console.error('Error fetching live renewal data:', err);
      setError('Error loading renewal data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return num ? num.toLocaleString() : '0';
  };

  const getPriorityClass = (count) => {
    if (count > 20) return 'priority-high';
    if (count > 10) return 'priority-medium';
    if (count > 0) return 'priority-low';
    return 'priority-none';
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      'labour_inspection': '🔍',
      'labour_license': '📋',
      'vehicle': '🚗',
      'ecp': '🛡️',
      'health': '❤️',
      'fire': '🔥',
      'life': '💼',
      'dsc': '🔐',
      'factory': '🏭',
      'stability': '🏗️',
      'plan': '📊'
    };
    return icons[serviceType] || '📄';
  };

  const getServiceName = (serviceType) => {
    const names = {
      'labour_inspection': 'Labour Inspection',
      'labour_license': 'Labour License',
      'vehicle': 'Vehicle Insurance',
      'ecp': 'Employee Compensation',
      'health': 'Health Insurance',
      'fire': 'Fire Policy',
      'life': 'Life Insurance',
      'dsc': 'Digital Signature',
      'factory': 'Factory Quotation',
      'stability': 'Stability Management',
      'plan': 'Plan Management'
    };
    return names[serviceType] || serviceType;
  };

  if (loading) {
    return (
      <div className="renewal-dashboard">
        <div className="dashboard-header">
          <h1>Renewal Dashboard</h1>
          <p>Live renewal tracking and management</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading renewal data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="renewal-dashboard">
        <div className="dashboard-header">
          <h1>Renewal Dashboard</h1>
          <p>Live renewal tracking and management</p>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchLiveData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="renewal-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🔄 Renewal Dashboard</h1>
          <p>Live renewal tracking and management</p>
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
        <button onClick={fetchLiveData} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {liveData?.totals && (
        <div className="summary-cards">
          <div className="summary-card total-upcoming">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <h3>Total Upcoming</h3>
              <div className="card-number">{formatNumber(liveData.totals.totalUpcoming)}</div>
            </div>
          </div>
          
          <div className="summary-card this-week">
            <div className="card-icon">⚠️</div>
            <div className="card-content">
              <h3>This Week</h3>
              <div className="card-number">{formatNumber(liveData.totals.totalExpiringThisWeek)}</div>
            </div>
          </div>
          
          <div className="summary-card next-week">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>Next Week</h3>
              <div className="card-number">{formatNumber(liveData.totals.totalExpiringNextWeek)}</div>
            </div>
          </div>
          
          <div className="summary-card this-month">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>This Month</h3>
              <div className="card-number">{formatNumber(liveData.totals.totalExpiringThisMonth)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Service Breakdown */}
      {liveData?.services && (
        <div className="services-section">
          <h2>Service Breakdown</h2>
          <div className="services-grid">
            {Object.entries(liveData.services).map(([serviceType, data]) => (
              <div key={serviceType} className={`service-card ${getPriorityClass(data.upcomingCount)}`}>
                <div className="service-header">
                  <div className="service-icon">{getServiceIcon(serviceType)}</div>
                  <div className="service-name">{getServiceName(serviceType)}</div>
                </div>
                
                <div className="service-stats">
                  <div className="stat-item">
                    <span className="stat-label">Upcoming:</span>
                    <span className="stat-value">{formatNumber(data.upcomingCount)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">This Week:</span>
                    <span className="stat-value">{formatNumber(data.expiringThisWeek)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Next Week:</span>
                    <span className="stat-value">{formatNumber(data.expiringNextWeek)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">This Month:</span>
                    <span className="stat-value">{formatNumber(data.expiringThisMonth)}</span>
                  </div>
                </div>

                {data.reminderIntervals && data.reminderIntervals.length > 0 && (
                  <div className="reminder-info">
                    <div className="reminder-label">Reminder Intervals:</div>
                    <div className="reminder-intervals">
                      {data.reminderIntervals.map((days, index) => (
                        <span key={index} className="reminder-badge">
                          {days}d
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data.error && (
                  <div className="service-error">
                    <span className="error-icon">⚠️</span>
                    {data.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn primary">
            📋 View All Renewals
          </button>
          <button className="action-btn secondary">
            ⚙️ Renewal Settings
          </button>
          <button className="action-btn secondary">
            📊 Renewal Reports
          </button>
          <button className="action-btn secondary">
            🔔 Email Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewalDashboard;
