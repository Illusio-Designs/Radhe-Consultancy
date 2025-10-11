import React, { useEffect, useState } from "react";
import { renewalAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import { toast } from "react-toastify";
import { BiErrorCircle, BiRefresh, BiCalendar, BiTime, BiAlertTriangle } from "react-icons/bi";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";

const LiveRenewalDashboard = () => {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLiveData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await renewalAPI.getLiveData();
      
      if (response && response.success && response.data) {
        setLiveData(response.data);
        setLastUpdated(new Date());
        console.log('Live renewal data fetched:', response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error("Error fetching live renewal data:", err);
      setError("Failed to fetch live renewal data");
      toast.error("Failed to fetch live renewal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchLiveData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getPriorityColor = (count) => {
    if (count === 0) return { bg: '#f3f4f6', color: '#6b7280' };
    if (count <= 3) return { bg: '#dcfce7', color: '#166534' };
    if (count <= 7) return { bg: '#fef3c7', color: '#92400e' };
    return { bg: '#fee2e2', color: '#991b1b' };
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'labour_inspection':
        return '🔍';
      case 'labour_license':
        return '📋';
      case 'vehicle':
        return '🚗';
      case 'ecp':
        return '👷';
      case 'health':
        return '🏥';
      case 'fire':
        return '🔥';
      case 'dsc':
        return '🔐';
      case 'factory':
        return '🏭';
      default:
        return '📄';
    }
  };

  return (
    <div className="insurance">
      <div className="insurance-container">
        <div className="insurance-content">
          <div className="insurance-header">
            <h1 className="insurance-title">Live Renewal Dashboard</h1>
            <p>Real-time overview of upcoming renewals across all services</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Last updated: {lastUpdated ? formatTimeAgo(lastUpdated) : 'Never'}
              </div>
              <button
                onClick={fetchLiveData}
                disabled={loading}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <BiRefresh className={loading ? 'spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="insurance-error">
              <BiErrorCircle className="inline mr-2" /> {error}
              <button 
                onClick={fetchLiveData}
                style={{
                  marginLeft: '16px',
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}

          {loading && !liveData ? (
            <Loader size="large" color="primary" />
          ) : liveData ? (
            <>

      {/* Summary Cards */}
      {liveData?.totals && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '32px' 
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <BiCalendar size={24} color="#3b82f6" />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Upcoming</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
              {liveData.totals.totalUpcoming}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Within reminder windows
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <BiTime size={24} color="#f59e0b" />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Expiring This Week</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
              {liveData.totals.totalExpiringThisWeek}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              High priority
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <BiAlertTriangle size={24} color="#ef4444" />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Expiring Next Week</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
              {liveData.totals.totalExpiringNextWeek}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Medium priority
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <BiCalendar size={24} color="#10b981" />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Expiring This Month</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
              {liveData.totals.totalExpiringThisMonth}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Plan ahead
            </div>
          </div>
        </div>
      )}

      {/* Service Breakdown */}
      {liveData?.services && (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>
            Service-wise Breakdown
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {Object.entries(liveData.services).map(([serviceType, data]) => {
              if (data.error) return null;
              
              const priorityColor = getPriorityColor(data.upcomingCount);
              
              return (
                <div key={serviceType} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr repeat(4, 120px)',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  {/* Service Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{getServiceIcon(serviceType)}</span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px' }}>
                        {data.serviceName || serviceType.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {data.reminderDays} days reminder window
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Count */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: priorityColor.bg,
                      color: priorityColor.color,
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>
                      {data.upcomingCount || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Upcoming
                    </div>
                  </div>

                  {/* This Week */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: data.expiringThisWeek > 0 ? '#fee2e2' : '#f3f4f6',
                      color: data.expiringThisWeek > 0 ? '#991b1b' : '#6b7280',
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>
                      {data.expiringThisWeek || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      This Week
                    </div>
                  </div>

                  {/* Next Week */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: data.expiringNextWeek > 0 ? '#fef3c7' : '#f3f4f6',
                      color: data.expiringNextWeek > 0 ? '#92400e' : '#6b7280',
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>
                      {data.expiringNextWeek || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      Next Week
                    </div>
                  </div>

                  {/* This Month */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: data.expiringThisMonth > 0 ? '#dcfce7' : '#f3f4f6',
                      color: data.expiringThisMonth > 0 ? '#166534' : '#6b7280',
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>
                      {data.expiringThisMonth || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      This Month
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Configuration Info */}
      {liveData?.services && (
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '16px', 
          padding: '24px', 
          marginTop: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
            Reminder Configuration
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {Object.entries(liveData.services).map(([serviceType, data]) => {
              if (data.error) return null;
              
              return (
                <div key={serviceType} style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{getServiceIcon(serviceType)}</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                      {data.serviceName || serviceType.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    <div>• Reminder window: {data.reminderDays} days before expiry</div>
                    <div>• Total reminders: {data.reminderTimes} times</div>
                    {data.reminderIntervals && data.reminderIntervals.length > 0 && (
                      <div>• Reminder intervals: {data.reminderIntervals.join(', ')} days before expiry</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading overlay for refresh */}
      {loading && liveData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <Loader size="medium" color="primary" />
            <div style={{ marginTop: '12px', color: '#6b7280' }}>Refreshing data...</div>
          </div>
        </div>
      )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LiveRenewalDashboard;
