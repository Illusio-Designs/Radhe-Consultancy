import React, { useEffect, useState } from "react";
import { renewalAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import Select from "react-select";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import {
  BiPlus,
  BiEdit,
  BiTrash,
  BiErrorCircle,
  BiShield,
  BiTrendingUp,
  BiCalendar,
} from "react-icons/bi";
import "../../../styles/pages/dashboard/renewals/RenewalSettings.css";

const RenewalForm = ({ config, onClose, onConfigUpdated }) => {
  const [formData, setFormData] = useState({
    serviceType: '',
    serviceName: '',
    reminderTimes: 3,
    reminderDays: 30
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultServices = [
    { value: 'vehicle', label: 'Vehicle Insurance' },
    { value: 'ecp', label: 'Employee Compensation Policy' },
    { value: 'health', label: 'Health Insurance' },
    { value: 'fire', label: 'Fire Insurance' },
    { value: 'dsc', label: 'Digital Signature Certificate' },
    { value: 'factory', label: 'Factory License' }
  ];

  useEffect(() => {
    if (config) {
      setFormData({
        serviceType: config.serviceType || '',
        serviceName: config.serviceName || '',
        reminderTimes: config.reminderTimes || 3,
        reminderDays: config.reminderDays || 30
      });
    }
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      if (config) {
        // Update existing config
        const response = await renewalAPI.updateRenewalConfig(config.id, formData);
        if (response.success) {
          onConfigUpdated();
          onClose();
        }
      } else {
        // Create new config
        const response = await renewalAPI.createRenewalConfig(formData);
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

  return (
    <form onSubmit={handleSubmit} className="renewal-form">
      <div className="renewal-form-grid">
        <div className="renewal-form-group">
          <label className="renewal-form-label">Service Type</label>
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
          <label className="renewal-form-label">Service Name</label>
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
          <label className="renewal-form-label">Reminder Times</label>
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
          <label className="renewal-form-label">Reminder Days</label>
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
      </div>

      {error && (
        <div className="renewal-form-error">
          <BiErrorCircle className="inline mr-2" /> {error}
        </div>
      )}

      <div className="renewal-form-actions">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={loading || !formData.serviceType || !formData.serviceName || !formData.reminderTimes || !formData.reminderDays}
        >
          {loading ? "Saving..." : (config ? "Update" : "Create")}
        </Button>
      </div>
    </form>
  );
};

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
            <div className="stat-label">All Configurations</div>
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
        <div className="stat-card recent">
          <div className="stat-icon">
            <BiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-number">{statistics.inactiveConfigs}</div>
            <div className="stat-label">Inactive Configurations</div>
            <div className="stat-percentage">{statistics.inactivePercentage}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RenewalSettings = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [statistics, setStatistics] = useState({
    totalConfigs: 0,
    activeConfigs: 0,
    inactiveConfigs: 0,
    activePercentage: 0,
    inactivePercentage: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchRenewalConfigs();
  }, []);

  const fetchRenewalConfigs = async () => {
    try {
      setLoading(true);
      const response = await renewalAPI.getRenewalConfigs();
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

  const calculateStatistics = (data) => {
    const total = data.length;
    const active = data.filter(config => config.isActive).length;
    const inactive = total - active;
    
    setStatistics({
      totalConfigs: total,
      activeConfigs: active,
      inactiveConfigs: inactive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
      inactivePercentage: total > 0 ? Math.round((inactive / total) * 100) : 0
    });
  };

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      try {
        const response = await renewalAPI.deleteRenewalConfig(id);
        if (response.success) {
          fetchRenewalConfigs();
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
    fetchRenewalConfigs();
  };

  const columns = [
    {
      key: "serviceName",
      label: "Service Name",
      render: (_, config) => (
        <div>
          <div className="font-medium">{config.serviceName}</div>
          <div className="text-sm text-gray-500">{config.serviceType}</div>
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
    <div className="renewal-settings">
      <div className="renewal-content">
        <div className="renewal-header">
          <h1 className="renewal-title">Renewal Settings</h1>
          <div className="list-container">
            <Button
              variant="contained"
              onClick={() => setShowModal(true)}
              icon={<BiPlus />}
            >
              Add Configuration
            </Button>
          </div>
        </div>
        
        <StatisticsCards statistics={statistics} loading={statsLoading} />
        
        {error && (
          <div className="renewal-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}

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

export default RenewalSettings;
