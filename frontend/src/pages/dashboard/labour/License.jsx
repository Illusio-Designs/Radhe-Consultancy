import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import { labourLicenseAPI } from "../../../services/api";
import { companyAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import Dropdown from "../../../components/common/Dropdown/Dropdown";
import "../../../styles/pages/dashboard/labour/Labour.css";
import "../../../styles/components/StatCards.css";
import { BiPlus, BiEdit, BiErrorCircle, BiFile, BiTrash, BiShield, BiTrendingUp, BiCalendar, BiCheckCircle, BiDownload } from "react-icons/bi";
import DocumentDownload from "../../../components/common/DocumentDownload/DocumentDownload";

// Statistics Cards Component
const StatisticsCards = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="statistics-section">
        <div className="statistics-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">
                <div className="loading-placeholder" style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#e5e7eb' }}></div>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  <div className="loading-placeholder" style={{ width: 60, height: 24, backgroundColor: '#e5e7eb', borderRadius: 4 }}></div>
                </div>
                <div className="stat-label">
                  <div className="loading-placeholder" style={{ width: 100, height: 16, backgroundColor: '#e5e7eb', borderRadius: 4 }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = statistics || {};

  return (
    <div className="statistics-section">
      <div className="statistics-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <BiShield />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total || 0}</div>
            <div className="stat-label">Total Licenses</div>
          </div>
        </div>
        
        <div className="stat-card active">
          <div className="stat-icon">
            <BiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.byStatus?.active || 0}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        
        <div className="stat-card recent">
          <div className="stat-icon">
            <BiTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.expiringSoon || 0}</div>
            <div className="stat-label">Expiring Soon</div>
          </div>
        </div>
        
        <div className="stat-card rejected">
          <div className="stat-icon">
            <BiCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.byStatus?.expired || 0}</div>
            <div className="stat-label">Expired</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Labour License Component
const LabourLicense = ({ searchQuery = "" }) => {
  console.log('[LabourLicense] Component rendered with searchQuery:', searchQuery);
  const [licenses, setLicenses] = useState([]);
  const [filteredLicenses, setFilteredLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [companies, setCompanies] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const { user, userRoles } = useAuth();

  // Check if user has permission to manage labour licenses
  const canManageLicenses = userRoles?.includes('admin') || 
                           userRoles?.includes('compliance_manager') || 
                           userRoles?.includes('labour_law_manager');

  // Fetch all licenses
  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await labourLicenseAPI.getAllLicenses();
      if (response.success) {
        setLicenses(response.data || []);
        setFilteredLicenses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching licenses:', error);
      setError(error.message || 'Failed to fetch licenses');
      toast.error(error.message || 'Failed to fetch licenses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await labourLicenseAPI.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getAllCompanies();
      if (response.success) {
        setCompanies(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  // Handle search when searchQuery changes
  useEffect(() => {
    console.log('[LabourLicense] searchQuery changed:', searchQuery);
    if (searchQuery && searchQuery.trim() !== "") {
      console.log('[LabourLicense] Calling handleSearchLicenses with:', searchQuery);
      handleSearchLicenses(searchQuery);
    } else {
      console.log('[LabourLicense] Setting filteredLicenses to all licenses');
      setFilteredLicenses(licenses);
    }
  }, [searchQuery, licenses]);

  // Initial data fetch
  useEffect(() => {
    fetchLicenses();
    fetchStatistics();
    fetchCompanies();
  }, []);

  // Handle search
  const handleSearchLicenses = async (query) => {
    try {
      const response = await labourLicenseAPI.searchLicenses(query);
      if (response.success) {
        setFilteredLicenses(response.data || []);
      }
    } catch (error) {
      console.error('Error searching licenses:', error);
      toast.error('Search failed');
    }
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredLicenses(licenses);
    } else {
      setFilteredLicenses(licenses.filter(license => license.status === status));
    }
  };

  // Handle status update
  const handleStatusUpdate = async (licenseId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [licenseId]: true }));
      const response = await labourLicenseAPI.updateLicense(licenseId, { status: newStatus });
      if (response.success) {
        toast.success('Status updated successfully');
        fetchLicenses(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [licenseId]: false }));
    }
  };

  // Handle create/edit license
  const handleSubmit = async (formData) => {
    try {
      if (selectedLicense) {
        // Update existing license
        const response = await labourLicenseAPI.updateLicense(selectedLicense.license_id, formData);
        if (response.success) {
          toast.success('License updated successfully');
          setShowModal(false);
          setSelectedLicense(null);
          fetchLicenses();
        }
      } else {
        // Create new license
        const response = await labourLicenseAPI.createLicense(formData);
        if (response.success) {
          toast.success('License created successfully');
          setShowModal(false);
          fetchLicenses();
        }
      }
    } catch (error) {
      console.error('Error saving license:', error);
      toast.error(error.message || 'Failed to save license');
    }
  };

  // Handle delete license
  const handleDelete = async (licenseId) => {
    if (window.confirm('Are you sure you want to delete this license?')) {
      try {
        const response = await labourLicenseAPI.deleteLicense(licenseId);
        if (response.success) {
          toast.success('License deleted successfully');
          fetchLicenses();
        }
      } catch (error) {
        console.error('Error deleting license:', error);
        toast.error(error.message || 'Failed to delete license');
      }
    }
  };

  const handleDownloadDocuments = (license) => {
    setSelectedLicense(license);
    setShowDocumentModal(true);
  };

  const canEdit = userRoles?.includes('admin') || userRoles?.includes('compliance_manager') || userRoles?.includes('labour_law_manager');
  const canDelete = userRoles?.includes('admin');

  // Table columns configuration
  const columns = [
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index) => index + 1,
    },
    {
      key: "company",
      label: "Company",
      sortable: true,
      render: (_, license) => (
        <div>
          <div className="font-medium">{license.company?.company_name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{license.company?.company_code || ''}</div>
        </div>
      ),
    },
    {
      key: "license_number",
      label: "License Number",
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "type",
      label: "License Type",
      sortable: true,
      render: (value) => (
        <span className={`license-type-badge ${value?.toLowerCase() === 'central' ? 'type-central' : 'type-state'}`}>
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: "expiry_date",
      label: "Expiry Date",
      sortable: true,
      render: (value, license) => {
        const expiryDate = new Date(value);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        const isExpired = expiryDate < today;
        const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        const isExpiredStatus = license.status === 'expired';
        
        let statusClass = '';
        let statusText = '';
        let emailServiceStatus = '';
        
        if (isExpiredStatus) {
          statusClass = 'expired-highlight';
          statusText = 'EXPIRED';
          emailServiceStatus = 'Email Service: INACTIVE';
        } else if (isExpired) {
          statusClass = 'expired-highlight';
          statusText = 'EXPIRED';
          emailServiceStatus = 'Email Service: INACTIVE';
        } else if (isExpiringSoon) {
          statusClass = 'expiring-soon-highlight';
          statusText = `${daysUntilExpiry} days left`;
          emailServiceStatus = 'Email Service: ACTIVE';
        } else {
          statusClass = 'active-highlight';
          statusText = 'Active';
          emailServiceStatus = 'Email Service: ACTIVE';
        }
        
        return (
          <div className={`expiry-date-cell ${statusClass}`}>
            <div className="expiry-date">
              {expiryDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
              })}
            </div>
            <div className={`expiry-status ${statusClass}`}>
              {statusText}
            </div>
            <div className="email-service-status">
              {emailServiceStatus}
          </div>
        </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value, license) => {
        const statusClass = 
          value === 'active' ? 'status-badge-active' :
          value === 'expired' ? 'status-badge-expired' :
          value === 'suspended' ? 'status-badge-suspended' :
          value === 'renewed' ? 'status-badge-renewed' : 'status-badge-default';
        
        // If user can edit, show interactive dropdown
        if (canEdit) {
          const isUpdating = updatingStatus[license.license_id];
          return (
            <div className="status-dropdown-container">
              <select
                value={value || 'active'}
                onChange={(e) => handleStatusUpdate(license.license_id, e.target.value)}
                className={`status-badge-dropdown ${statusClass}`}
                disabled={isUpdating}
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
                <option value="renewed">Renewed</option>
              </select>
              {isUpdating && (
                <div className="status-updating-indicator">
                  <Loader size="small" />
                </div>
              )}
            </div>
          );
        }
        
        // For read-only users, show status badge
        return (
          <span className={`status-badge ${statusClass}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, license) => (
        <div className="insurance-actions">
          {canEdit && (
            <ActionButton
              onClick={() => {
                setSelectedLicense(license);
                setShowModal(true);
              }}
              variant="secondary"
              size="small"
              title="Edit"
            >
              <BiEdit />
            </ActionButton>
          )}
          
          {canDelete && (
            <ActionButton
              onClick={() => handleDelete(license.license_id)}
              variant="danger"
              size="small"
              title="Delete"
            >
              <BiTrash />
            </ActionButton>
          )}
        </div>
      ),
    }
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "suspended", label: "Suspended" },
    { value: "renewed", label: "Renewed" }
  ];

  const handleFilterChange = () => {
    fetchLicenses();
  };

  const handleSearch = () => {
    fetchLicenses();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="labour-container">
      <div className="labour-content">
        <div className="labour-header">
          <h1 className="labour-title">Labour License Management</h1>
          <div className="list-container">
            {canManageLicenses && (
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedLicense(null);
                  setShowModal(true);
                }}
                icon={<BiPlus />}
              >
                Add License
              </Button>
            )}
            
            <div className="dashboard-header-dropdown-container">
              <Dropdown
                options={statusOptions}
                value={statusOptions.find((opt) => opt.value === statusFilter)}
                onChange={(option) => {
                  setStatusFilter(option ? option.value : "all");
                  handleFilterChange();
                }}
                placeholder="Filter by Status"
              />
            </div>
          </div>
        </div>

        <StatisticsCards statistics={statistics} loading={statsLoading} />
        
        {error && (
          <div className="compliance-form-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}

        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={filteredLicenses}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedLicense(null);
        }}
        title={selectedLicense ? 'Edit Labour License' : 'Add New Labour License'}
      >
        <LicenseForm
          license={selectedLicense}
          companies={companies}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedLicense(null);
          }}
        />
      </Modal>

      {/* Document Download Modal */}
      {showDocumentModal && selectedLicense && (
        <DocumentDownload
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          system="labour-license"
          recordId={selectedLicense.license_id}
          recordName={selectedLicense.company?.company_name || selectedLicense.company_name}
        />
      )}
    </div>
  );
};

// License Form Component
const LicenseForm = ({ license, companies, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    company_id: '',
    license_number: '',
    expiry_date: '',
    status: 'Active',
    type: '',
    remarks: ''
  });

  const [files, setFiles] = useState([]);

  // Initialize form data when editing
  useEffect(() => {
    if (license) {
      setFormData({
        company_id: license.company_id || '',
        license_number: license.license_number || '',
        expiry_date: license.expiry_date ? new Date(license.expiry_date).toISOString().split('T')[0] : '',
        status: license.status || 'Active',
        type: license.type || '',
        remarks: license.remarks || ''
      });
    }
  }, [license]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.company_id || !formData.license_number || !formData.expiry_date || !formData.type) {
      toast.error('Company, license number, expiry date, and license type are required');
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    
    // Append form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    // Append files
    if (files.length > 0) {
      files.forEach(file => {
        submitData.append('files', file);
      });
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="insurance-form">
      <div className="insurance-form-grid">
        <div className="insurance-form-group">
          <select
            id="company_id"
            name="company_id"
            value={formData.company_id}
            onChange={handleChange}
            required
            className="insurance-form-input"
          >
            <option value="">Select Company</option>
            {companies.map(company => (
              <option key={company.company_id} value={company.company_id}>
                {company.company_name} ({company.company_code})
              </option>
            ))}
          </select>
        </div>
        
        <div className="insurance-form-group">
          <input
            type="text"
            id="license_number"
            name="license_number"
            value={formData.license_number}
            onChange={handleChange}
            required
            className="insurance-form-input"
            placeholder="Enter license number"
          />
      </div>

        <div className="insurance-form-group">
          <input
            type="date"
            id="expiry_date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
            required
            className="insurance-form-input"
          />
        </div>
      </div>

      <div className="insurance-form-actions">
        <Button type="button" onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {license ? 'Update License' : 'Create License'}
        </Button>
      </div>
    </form>
  );
};

export default LabourLicense;
