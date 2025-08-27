import React, { useEffect, useState } from "react";
import { renewalAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/renewals/RenewalLog.css";

const RenewalLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRenewalLogs();
  }, []);

  const fetchRenewalLogs = async () => {
    try {
      setLoading(true);
      const response = await renewalAPI.getLogs();
      if (response.success) {
        setLogs(response.data || []);
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
            <p>Showing {logs.length} renewal reminder logs</p>
            <button 
              className="refresh-button"
              onClick={fetchRenewalLogs}
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