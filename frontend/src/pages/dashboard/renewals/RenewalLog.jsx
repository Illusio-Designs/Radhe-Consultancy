import React, { useEffect, useState } from "react";
import { renewalAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/renewals/RenewalLog.css";
import "../../../styles/components/StatCards.css";

const RenewalLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    policy_type: '',
    reminder_type: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchRenewalLogs();
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handlePageChange = (newPage) => {
    fetchRenewalLogs(newPage);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      policy_type: '',
      reminder_type: ''
    });
  };

  const fetchRenewalLogs = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = {
        page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await renewalAPI.getLogs(queryParams);
      if (response.success) {
        setLogs(response.data || []);
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            page: response.pagination.page,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages
          }));
        }
      } else {
        setError("Failed to fetch renewal logs");
      }
    } catch (err) {
      console.error("Error fetching renewal logs:", err);
      setError("Failed to fetch renewal logs");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'sent': { bg: '#d1fae5', color: '#065f46', text: 'Sent' },
      'delivered': { bg: '#dbeafe', color: '#1e40af', text: 'Delivered' },
      'failed': { bg: '#fee2e2', color: '#991b1b', text: 'Failed' },
      'opened': { bg: '#fef3c7', color: '#92400e', text: 'Opened' },
      'clicked': { bg: '#dcfce7', color: '#166534', text: 'Clicked' }
    };
    
    const config = statusConfig[status] || statusConfig['sent'];
    return (
      <span style={{
        padding: "6px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: config.bg,
        color: config.color
      }}>
        {config.text}
      </span>
    );
  };

  const getReminderTypeIcon = (type) => {
    const icons = {
      'email': '📧',
      'sms': '📱',
      'whatsapp': '💬'
    };
    return icons[type] || '📧';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="renewal-log">
      <div className="renewal-log-content">
        <div className="renewal-log-header">
          <h1 className="renewal-log-title">📋 Renewal Log History</h1>
          <p className="renewal-log-subtitle">Complete history of all renewal reminders sent</p>
        </div>

        {/* Filter Controls */}
        <div className="renewal-log-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="opened">Opened</option>
              <option value="clicked">Clicked</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Policy Type:</label>
            <select 
              value={filters.policy_type} 
              onChange={(e) => handleFilterChange('policy_type', e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="vehicle">Vehicle Insurance</option>
              <option value="health">Health Insurance</option>
              <option value="fire">Fire Insurance</option>
              <option value="dsc">Digital Signature</option>
              <option value="factory">Factory License</option>
              <option value="labour_license">Labour License</option>
              <option value="labour_inspection">Labour Inspection</option>
              <option value="stability">Stability Management</option>
              <option value="life">Life Insurance</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Reminder Type:</label>
            <select 
              value={filters.reminder_type} 
              onChange={(e) => handleFilterChange('reminder_type', e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          <button 
            onClick={clearFilters}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>

        {error && (
          <div className="renewal-log-error">
            <span>❌</span> {error}
          </div>
        )}

        <div className="renewal-log-stats">
          <div className="stat-card">
            <div className="stat-number">{logs.length}</div>
            <div className="stat-label">Total Reminders</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{logs.filter(log => log.status === 'sent' || log.status === 'delivered').length}</div>
            <div className="stat-label">Successful</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{logs.filter(log => log.status === 'failed').length}</div>
            <div className="stat-label">Failed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{logs.filter(log => log.status === 'opened' || log.status === 'clicked').length}</div>
            <div className="stat-label">Engaged</div>
          </div>
        </div>

        <div className="renewal-log-table">
          <div className="table-header">
            <div className="header-cell">Policy Info</div>
            <div className="header-cell">Client Details</div>
            <div className="header-cell">Reminder Details</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Sent Date</div>
            <div className="header-cell">Days Until Expiry</div>
          </div>

          {logs.length === 0 ? (
            <div className="no-logs">
              <div className="no-logs-icon">📝</div>
              <h3>No Renewal Logs Found</h3>
              <p>Renewal reminders will appear here once they are sent.</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={log.id || index} className="table-row">
                <div className="table-cell policy-info">
                  <div className="policy-type">{log.policy_type?.toUpperCase() || 'UNKNOWN'}</div>
                  <div className="policy-id">ID: {log.policy_id}</div>
                  {log.email_subject && (
                    <div className="email-subject">{log.email_subject}</div>
                  )}
                </div>
                
                <div className="table-cell client-details">
                  <div className="client-name">{log.client_name || 'N/A'}</div>
                  <div className="client-email">{log.client_email || 'N/A'}</div>
                </div>
                
                <div className="table-cell reminder-details">
                  <div className="reminder-type">
                    {getReminderTypeIcon(log.reminder_type)} {log.reminder_type?.toUpperCase() || 'EMAIL'}
                  </div>
                  <div className="reminder-day">Day {log.reminder_day}</div>
                  {log.expiry_date && (
                    <div className="expiry-date">Expires: {formatDate(log.expiry_date)}</div>
                  )}
                </div>
                
                <div className="table-cell status-cell">
                  {getStatusBadge(log.status)}
                </div>
                
                <div className="table-cell sent-date">
                  {formatDate(log.sent_at)}
                </div>
                
                <div className="table-cell days-until-expiry">
                  <span className={`days-badge ${log.days_until_expiry <= 7 ? 'urgent' : log.days_until_expiry <= 30 ? 'warning' : 'normal'}`}>
                    {log.days_until_expiry || 'N/A'} days
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {logs.length > 0 && (
          <div className="renewal-log-footer">
            <div className="pagination-info">
              <p>Showing {logs.length} of {pagination.total} renewal reminder logs</p>
              <p>Page {pagination.page} of {pagination.totalPages}</p>
            </div>
            
            <div className="pagination-controls">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="page-info">
                {pagination.page} / {pagination.totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
            
            <button 
              className="refresh-button"
              onClick={() => fetchRenewalLogs(pagination.page)}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh Logs'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RenewalLog; 