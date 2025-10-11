import React, { useEffect, useState } from "react";
import { renewalAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import Select from "react-select";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import {
  BiEdit,
  BiTrash,
  BiErrorCircle,
  BiShield,
  BiTrendingUp,
  BiCalendar,
  BiCog,
  BiListUl,
  BiRefresh,
  BiPlus,
  BiCar,
  BiUser,
  BiHeart,
  BiKey,
  BiBuilding,
  BiFileBlank,
  BiSearch,
} from "react-icons/bi";
import "../../../styles/pages/dashboard/renewals/RenewalDashboard.css";

// Renewal Form Component
const RenewalForm = ({ config, onClose, onConfigUpdated }) => {
  const [formData, setFormData] = useState({
    serviceType: '',
    serviceName: '',
    reminderTimes: 3,
    reminderDays: 30,
    reminderIntervals: [30, 21, 14, 7, 1]
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultServices = [
    { value: 'vehicle', label: 'Vehicle Insurance' },
    { value: 'ecp', label: 'Employee Compensation Policy' },
    { value: 'health', label: 'Health Insurance' },
    { value: 'fire', label: 'Fire Insurance' },
    { value: 'dsc', label: 'Digital Signature Certificate' },
    { value: 'factory', label: 'Factory License' },
    { value: 'labour_license', label: 'Labour License' },
    { value: 'labour_inspection', label: 'Labour Inspection' },
    { value: 'stability', label: 'Stability Management' },
    { value: 'life', label: 'Life Insurance' }
  ];

  useEffect(() => {
    if (config) {
      setFormData({
        serviceType: config.serviceType || '',
        serviceName: config.serviceName || '',
        reminderTimes: config.reminderTimes || 3,
        reminderDays: config.reminderDays || 30,
        reminderIntervals: config.reminderIntervals || [30, 21, 14, 7, 1]
      });
    }
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      if (config) {
        const response = await renewalAPI.updateConfig(config.id, formData);
        if (response.success) {
          onConfigUpdated();
          onClose();
        }
      } else {
        const response = await renewalAPI.createConfig(formData);
        if (response.success) {
          onConfigUpdated();
          onClose();
        }
      }
    } catch (err) {
      setError("Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceTypeChange = (selectedOption) => {
    setFormData({
      ...formData,
      serviceType: selectedOption.value,
      serviceName: selectedOption.label
    });
  };

  const handleReminderIntervalsChange = (e) => {
    const value = e.target.value;
    const intervals = value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    setFormData({
      ...formData,
      reminderIntervals: intervals
    });
  };

  return (
    <form onSubmit={handleSubmit} className="renewal-form">
      <div className="renewal-form-grid">
        <div className="renewal-form-group">
          <label>Service Type</label>
          <Select
            value={defaultServices.find(s => s.value === formData.serviceType)}
            onChange={handleServiceTypeChange}
            options={defaultServices}
            placeholder="Select Service Type"
            isClearable
            className="renewal-form-input"
            classNamePrefix="select"
          />
        </div>

        <div className="renewal-form-group">
          <label>Service Name</label>
          <input
            type="text"
            className="renewal-form-input"
            value={formData.serviceName}
            onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
            placeholder="Service Name"
            readOnly
          />
        </div>

        <div className="renewal-form-group">
          <label>Reminder Times</label>
          <input
            type="number"
            className="renewal-form-input"
            value={formData.reminderTimes}
            onChange={(e) => setFormData({ ...formData, reminderTimes: parseInt(e.target.value) || 0 })}
            placeholder="How many times"
            min="1"
            max="10"
            required
          />
        </div>

        <div className="renewal-form-group">
          <label>Reminder Days</label>
          <input
            type="number"
            className="renewal-form-input"
            value={formData.reminderDays}
            onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) || 0 })}
            placeholder="Days before expiry"
            min="1"
            max="365"
            required
          />
        </div>

        <div className="renewal-form-group full-width">
          <label>Reminder Intervals (comma-separated days)</label>
          <input
            type="text"
            className="renewal-form-input"
            value={formData.reminderIntervals.join(', ')}
            onChange={handleReminderIntervalsChange}
            placeholder="30, 21, 14, 7, 1"
            required
          />
        </div>
      </div>

      {error && (
        <div className="renewal-form-error">
          <BiErrorCircle className="inline mr-2" /> {error}
        </div>
      )}

      <div className="renewal-form-actions">
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={loading || !formData.serviceType || !formData.serviceName}
        >
          {loading ? "Saving..." : (config ? "Update" : "Create")}
        </Button>
      </div>
    </form>
  );
};

// Statistics Cards Component
const StatisticsCards = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="statistics-section">
        <div className="statistics-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card loading-placeholder">
              <div className="stat-icon"></div>
              <div className="stat-content">
                <div className="stat-number">--</div>
                <div className="stat-label">Loading...</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-section">
      <div className="statistics-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <BiShield />
          </div>
          <div className="stat-content">
            <div className="stat-number">{statistics.totalConfigs}</div>
            <div className="stat-label">Total Configurations</div>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <BiTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-number">{statistics.activeConfigs}</div>
            <div className="stat-label">Active Configurations</div>
            <div className="stat-percentage">{statistics.activePercentage}%</div>
          </div>
        </div>
        <div className="stat-card upcoming">
          <div className="stat-icon">
            <BiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-number">{statistics.upcomingRenewals}</div>
            <div className="stat-label">Upcoming Renewals</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Renewal Dashboard Component
const RenewalDashboard = () => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [configs, setConfigs] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [renewalsList, setRenewalsList] = useState([]);
  const [serviceResults, setServiceResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [statistics, setStatistics] = useState({
    totalConfigs: 0,
    activeConfigs: 0,
    upcomingRenewals: 0,
    activePercentage: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch renewal list when list tab is active
  useEffect(() => {
    if (activeTab === 'list' && renewalsList.length === 0) {
      fetchRenewalList();
    }
  }, [activeTab]);

  const fetchData = async () => {
    await Promise.all([
      fetchRenewalConfigs(),
      fetchLiveData()
    ]);
  };

  const fetchRenewalConfigs = async () => {
    try {
      setLoading(true);
      const response = await renewalAPI.getAllConfigs();
      if (response.success) {
        setConfigs(response.data || []);
        calculateStatistics(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching renewal configs:", err);
      setError("Failed to fetch renewal configurations");
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };


  const fetchLiveData = async () => {
    try {
      const response = await renewalAPI.getLiveData();
      if (response.success) {
        setLiveData(response.data);
      }
    } catch (err) {
      console.error("Error fetching live data:", err);
    }
  };

  const fetchRenewalList = async (serviceType = 'all', period = 30) => {
    try {
      setListLoading(true);
      let response;
      
      if (serviceType === 'all') {
        // Fetch from all service types
        const serviceTypes = ['vehicle', 'ecp', 'health', 'fire', 'dsc', 'factory', 'labour_license', 'labour_inspection', 'stability', 'life'];
        const promises = serviceTypes.map(type => 
          renewalAPI.getListByTypeAndPeriod(type, period)
        );
        const results = await Promise.all(promises);
        
        // Process results to show all data including errors and empty results
        const processedResults = results.map((result, index) => ({
          serviceType: serviceTypes[index],
          serviceName: getServiceName(serviceTypes[index]),
          success: result.success,
          data: result.success ? result.data : [],
          error: result.success ? null : result.message || 'Unknown error',
          count: result.success ? (result.data ? result.data.length : 0) : 0
        }));
        
        // Log results for debugging
        console.log('All service results:', processedResults);
        console.log('Raw API results:', results);
        console.log('Processed results with data:', processedResults.filter(r => r.success && r.data.length > 0));
        
        // Flatten successful results for the main list
        const allRenewals = results
          .filter(result => result.success && result.data && result.data.length > 0)
          .flatMap(result => result.data)
          .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
        
        console.log('All renewals fetched:', allRenewals);
        console.log('Renewals count:', allRenewals.length);
        console.log('First renewal sample:', allRenewals[0]);
        setRenewalsList(allRenewals);
        setServiceResults(processedResults);
      } else {
        response = await renewalAPI.getListByTypeAndPeriod(serviceType, period);
        console.log('Single service response:', response);
        if (response.success) {
          setRenewalsList(response.data);
        } else {
          setError("Failed to fetch renewal list");
        }
        setServiceResults([]); // Clear service results for single service
      }
    } catch (err) {
      console.error("Error fetching renewal list:", err);
      setError("Failed to fetch renewal list");
    } finally {
      setListLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    const total = data.length;
    const active = data.filter(config => config.isActive).length;
    const upcoming = Object.values(liveData || {}).reduce((sum, service) => sum + (service.upcomingCount || 0), 0);
    
    setStatistics({
      totalConfigs: total,
      activeConfigs: active,
      upcomingRenewals: upcoming,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    });
  };

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      try {
        const response = await renewalAPI.deleteConfig(id);
        if (response.success) {
          fetchData();
        }
      } catch (err) {
        console.error("Error deleting renewal config:", err);
        setError("Failed to delete configuration");
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedConfig(null);
  };

  const handleConfigUpdated = () => {
    fetchData();
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      vehicle: <BiCar />,
      ecp: <BiUser />,
      health: <BiHeart />,
      fire: <BiShield />,
      dsc: <BiKey />,
      factory: <BiBuilding />,
      labour_license: <BiFileBlank />,
      labour_inspection: <BiSearch />,
      stability: <BiTrendingUp />,
      life: <BiHeart />
    };
    return icons[serviceType] || <BiFileBlank />;
  };

  const getServiceName = (serviceType) => {
    const names = {
      vehicle: 'Vehicle Insurance',
      ecp: 'Employee Compensation',
      health: 'Health Insurance',
      fire: 'Fire Insurance',
      dsc: 'Digital Signature',
      factory: 'Factory License',
      labour_license: 'Labour License',
      labour_inspection: 'Labour Inspection',
      stability: 'Stability Management',
      life: 'Life Insurance'
    };
    return names[serviceType] || serviceType;
  };

  const getPriorityClass = (count) => {
    if (count === 0) return 'priority-none';
    if (count <= 5) return 'priority-low';
    if (count <= 15) return 'priority-medium';
    return 'priority-high';
  };

  // Statistics Data Tab - Show live renewal data
  const renderStatisticsTab = () => {
    if (!liveData) {
      return (
        <div className="tab-content">
          <div className="tab-header">
            <h2>Statistics Data</h2>
            <Button
              variant="outlined"
              onClick={fetchLiveData}
              icon={<BiRefresh />}
            >
              Refresh Data
            </Button>
          </div>
          <div className="empty-state">
            <div className="empty-icon">
              <BiTrendingUp />
            </div>
            <h3>No Data Available</h3>
            <p>Click refresh to load statistics data.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Statistics Data</h2>
          <Button
            variant="outlined"
            onClick={fetchLiveData}
            icon={<BiRefresh />}
          >
            Refresh Data
          </Button>
        </div>

        {/* Summary Cards */}
            <div className="statistics-cards-grid">
          <div className="stat-card total-upcoming">
                <div className="stat-icon">
                  <BiCalendar />
                </div>
                <div className="stat-content">
              <div className="stat-number">{formatNumber(Object.values(liveData).reduce((sum, service) => sum + (service.upcomingCount || 0), 0))}</div>
                  <div className="stat-label">Total Upcoming</div>
                </div>
              </div>

          <div className="stat-card this-week">
                <div className="stat-icon">
                  <BiErrorCircle />
                </div>
                <div className="stat-content">
              <div className="stat-number">{formatNumber(Object.values(liveData).reduce((sum, service) => sum + (service.expiringThisWeek || 0), 0))}</div>
                  <div className="stat-label">This Week</div>
                </div>
              </div>

          <div className="stat-card next-week">
                <div className="stat-icon">
                  <BiListUl />
                </div>
                <div className="stat-content">
              <div className="stat-number">{formatNumber(Object.values(liveData).reduce((sum, service) => sum + (service.expiringNextWeek || 0), 0))}</div>
                  <div className="stat-label">Next Week</div>
                </div>
              </div>

          <div className="stat-card this-month">
                <div className="stat-icon">
                  <BiTrendingUp />
                </div>
                <div className="stat-content">
              <div className="stat-number">{formatNumber(Object.values(liveData).reduce((sum, service) => sum + (service.expiringThisMonth || 0), 0))}</div>
                  <div className="stat-label">This Month</div>
              </div>
            </div>
          </div>

          {/* Service Breakdown */}
        <div className="services-breakdown">
          <h3>Service Breakdown</h3>
            <div className="services-grid">
              {Object.entries(liveData).map(([serviceType, data]) => (
                <div key={serviceType} className={`service-card ${getPriorityClass(data.upcomingCount)} ${data.error ? 'error-card' : ''}`}>
                  <div className="service-header">
                    <div className="service-icon">{getServiceIcon(serviceType)}</div>
                    <div className="service-name">{data.serviceName || getServiceName(serviceType)}</div>
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

                  {data.reminderIntervals && Array.isArray(data.reminderIntervals) && data.reminderIntervals.length > 0 && (
                    <div className="reminder-intervals">
                      <div className="intervals-label">Reminder Intervals:</div>
                      <div className="intervals-list">
                        {data.reminderIntervals.map((interval, index) => (
                          <span key={index} className="interval-badge">
                            {interval}d
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.error && (
                    <div className="service-error">
                      <span className="error-icon">
                        <BiErrorCircle />
                      </span>
                      <span className="error-message">{data.error}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
    </div>
  );
};


  // Settings Tab - Show all configurations for management
  const renderSettingsTab = () => {
    const columns = [
      {
        key: "serviceName",
        label: "Service Name",
        render: (_, config) => (
          <div className="service-info">
            <div className="service-icon">{getServiceIcon(config.serviceType)}</div>
            <div className="service-details">
              <div className="font-medium">{config.serviceName}</div>
            </div>
          </div>
        ),
      },
      {
        key: "reminderTimes",
        label: "Reminder Times",
        render: (_, config) => (
          <span className="badge bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {config.reminderTimes} times
          </span>
        ),
      },
      {
        key: "reminderDays",
        label: "Reminder Days",
        render: (_, config) => (
          <span className="badge bg-green-100 text-green-800 px-2 py-1 rounded">
            {config.reminderDays} days
          </span>
        ),
      },
      {
        key: "isActive",
        label: "Status",
        render: (_, config) => (
          <span className={`badge ${config.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-2 py-1 rounded`}>
            {config.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (_, config) => (
          <div className="renewal-actions">
            <ActionButton
              onClick={() => handleEdit(config)}
              variant="secondary"
              size="small"
            >
              <BiEdit />
            </ActionButton>
            <ActionButton
              onClick={() => handleDelete(config.id)}
              variant="danger"
              size="small"
            >
              <BiTrash />
            </ActionButton>
          </div>
        ),
      },
    ];

    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Renewal Settings</h2>
          <Button
            variant="contained"
            onClick={() => setShowModal(true)}
            icon={<BiPlus />}
          >
            Add Configuration
          </Button>
        </div>

        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={configs}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>
    );
  };

  // List Tab - Show upcoming renewals list
  const renderListTab = () => {
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Upcoming Renewals List</h2>
          <div className="tab-controls">
            <select 
              value={selectedServiceType} 
              onChange={(e) => {
                setSelectedServiceType(e.target.value);
                fetchRenewalList(e.target.value);
              }}
              className="service-filter"
            >
              <option value="all">All Services</option>
              <option value="vehicle">Vehicle Insurance</option>
              <option value="ecp">Employee Compensation Policy</option>
              <option value="health">Health Insurance</option>
              <option value="fire">Fire Insurance</option>
              <option value="dsc">Digital Signature</option>
              <option value="factory">Factory License</option>
              <option value="labour_license">Labour License</option>
              <option value="labour_inspection">Labour Inspection</option>
              <option value="stability">Stability Management</option>
              <option value="life">Life Insurance</option>
            </select>
            <Button
              variant="outlined"
              onClick={() => fetchRenewalList(selectedServiceType)}
              icon={<BiRefresh />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {listLoading ? (
          <Loader size="large" color="primary" />
        ) : (
          <div>
            {/* Debug Info */}
            <div style={{padding: '10px', background: '#e3f2fd', marginBottom: '10px', borderRadius: '4px'}}>
              <strong>Debug Info:</strong> renewalsList.length = {renewalsList.length}, serviceResults.length = {serviceResults.length}
            </div>

            {/* Service Results Summary */}
            {serviceResults.length > 0 && (
              <div className="service-results-summary" style={{marginBottom: '20px'}}>
                <h3>Service Results Summary</h3>
                <div className="service-results-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px'}}>
                  {serviceResults.map((result, index) => (
                    <div key={index} className={`service-result-card ${result.success ? 'success' : 'error'}`} 
                         style={{
                           padding: '12px',
                           borderRadius: '8px',
                           border: `2px solid ${result.success ? '#28a745' : '#dc3545'}`,
                           backgroundColor: result.success ? '#d4edda' : '#f8d7da'
                         }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                        {getServiceIcon(result.serviceType)}
                        <strong>{result.serviceName}</strong>
                      </div>
                      <div style={{fontSize: '14px'}}>
                        {result.success ? (
                          <span style={{color: '#155724'}}>
                            ✅ {result.count} renewals found
                          </span>
                        ) : (
                          <span style={{color: '#721c24'}}>
                            ❌ Error: {result.error}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Renewals List */}
            {renewalsList.length > 0 ? (
              <div className="renewals-list">
                <h3>All Renewals ({renewalsList.length} total)</h3>
                {renewalsList.map((renewal, index) => (
                  <div key={renewal.id || index} className="renewal-item">
                    <div className="renewal-icon">
                      {getServiceIcon(renewal.serviceType)}
                    </div>
                    <div className="renewal-details">
                      <div className="renewal-title">{getServiceName(renewal.serviceType)}</div>
                      <div className="renewal-meta">
                        <span className="renewal-policy">Policy: {renewal.policyNumber}</span>
                        <span className="renewal-client">Client: {renewal.clientName}</span>
                        <span className="renewal-email">Email: {renewal.clientEmail}</span>
                        <span className="renewal-date">Expires: {new Date(renewal.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="renewal-status">
                      <span className={`status-badge ${getPriorityClass(renewal.daysUntilExpiry)}`}>
                        {renewal.daysUntilExpiry} days
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <BiListUl />
                </div>
                <h3>No Upcoming Renewals</h3>
                <p>There are no upcoming renewals to display at this time.</p>
                {serviceResults.length > 0 && (
                  <div style={{padding: '10px', background: '#fff3cd', marginTop: '10px', borderRadius: '4px'}}>
                    <strong>Note:</strong> Some services returned 0 results or had errors. Check the summary above for details.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="renewal-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Renewal Management</h1>
          <p>Manage renewal configurations and track upcoming renewals</p>
        </div>
        <div className="header-actions">
          <Button
            variant="outlined"
            onClick={fetchData}
            icon={<BiRefresh />}
          >
            Refresh All
          </Button>
        </div>
      </div>


      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          <BiTrendingUp className="tab-icon" />
          Statistics Data
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <BiCog className="tab-icon" />
          Settings
        </button>
        <button
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <BiListUl className="tab-icon" />
          List
        </button>
      </div>

      {error && (
        <div className="renewal-error">
          <BiErrorCircle className="inline mr-2" /> {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'statistics' && renderStatisticsTab()}
      {activeTab === 'settings' && renderSettingsTab()}
      {activeTab === 'list' && renderListTab()}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedConfig ? "Edit Configuration" : "Add New Configuration"}
      >
        <RenewalForm
          config={selectedConfig}
          onClose={handleModalClose}
          onConfigUpdated={handleConfigUpdated}
        />
      </Modal>
    </div>
  );
};

export default RenewalDashboard;
