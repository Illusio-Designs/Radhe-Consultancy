import React, { useState, useEffect } from "react";
import {
  BiCheck,
  BiX,
  BiUpload,
  BiFile,
  BiUser,
  BiCalendar,
  BiEdit,
  BiShield,
  BiTrendingUp,
  BiErrorCircle,
  BiAnchor,
} from "react-icons/bi";
import { stabilityManagementAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/compliance/Compliance.css";
import "../../../styles/components/StatCards.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../contexts/AuthContext";
import DocumentDownload from "../../../components/common/DocumentDownload/DocumentDownload";

// File Upload Modal
const FileUploadModal = ({ onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [stabilityDate, setStabilityDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    if (!stabilityDate) {
      toast.error('Please select a stability date');
      return;
    }

    setLoading(true);
    try {
      await onUpload(files, stabilityDate);
      toast.success('Files uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Upload Files & Approve Stability">
      <div className="insurance-form">
        <div className="insurance-form-grid">
          <div className="insurance-form-group">
            <input
              type="date"
              value={stabilityDate}
              onChange={(e) => setStabilityDate(e.target.value)}
              className="insurance-form-input"
              required
            />
            <small className="text-gray-500">
              Renewal date will be automatically calculated (5 years after stability date)
            </small>
          </div>

          <div className="file-upload-group">
            <label className="file-upload-label">Select Files</label>
            <div className="file-upload-container">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="file-upload-input"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
              />
              <Button
                type="button"
                variant="outlined"
                className="file-upload-button"
                onClick={() => document.querySelector('input[type="file"]').click()}
              >
                <BiUpload className="mr-2" />
                Choose Files
              </Button>
            </div>
            <small className="text-gray-500">
              Allowed file types: PDF, Word, Excel, Images, Text (Max 10MB each, up to 10 files)
            </small>
          </div>
        </div>

        {files.length > 0 && (
          <div className="selected-files">
            <h4>Selected Files:</h4>
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <BiFile /> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            ))}
          </div>
        )}

        <div className="insurance-form-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleUpload} variant="contained" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload & Approve'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Reject Modal
const RejectModal = ({ onClose, onReject }) => {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!remarks.trim()) {
      toast.error('Please enter remarks for rejection');
      return;
    }

    setLoading(true);
    try {
      await onReject(remarks);
      toast.success('Stability rejected successfully');
    } catch (error) {
      toast.error('Failed to reject stability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Reject Stability">
      <div className="reject-modal">
        <div className="form-group">
          <label>Remarks (Required):</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="form-control"
            rows="4"
            placeholder="Enter rejection remarks..."
            required
          />
        </div>

        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleReject} variant="contained" disabled={loading}>
            {loading ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Statistics Cards Component
const StatisticsCards = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="statistics-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="stat-card loading">
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
    );
  }

  if (!statistics) {
    return (
      <div className="statistics-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="stat-card loading">
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
    );
  }

  const { total, stability, submit, approved, rejected, withLoad, withoutLoad, recent } = statistics;

  return (
    <div className="statistics-grid">
      <div className="stat-card total">
        <div className="stat-icon">
          <BiShield />
        </div>
        <div className="stat-content">
          <div className="stat-number">{total}</div>
          <div className="stat-label">Total Records</div>
        </div>
      </div>
      <div className="stat-card stability">
        <div className="stat-icon">
          <BiFile />
        </div>
        <div className="stat-content">
          <div className="stat-number">{stability}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>
      <div className="stat-card submit">
        <div className="stat-icon">
          <BiTrendingUp />
        </div>
        <div className="stat-content">
          <div className="stat-number">{submit}</div>
          <div className="stat-label">Submitted</div>
        </div>
      </div>
      <div className="stat-card approved">
        <div className="stat-icon">
          <BiCheck />
        </div>
        <div className="stat-content">
          <div className="stat-number">{approved}</div>
          <div className="stat-label">Approved</div>
        </div>
      </div>
      <div className="stat-card rejected">
        <div className="stat-icon">
          <BiErrorCircle />
        </div>
        <div className="stat-content">
          <div className="stat-number">{rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>
      <div className="stat-card withLoad">
        <div className="stat-icon">
          <BiAnchor />
        </div>
        <div className="stat-content">
          <div className="stat-number">{withLoad}</div>
          <div className="stat-label">With Load</div>
        </div>
      </div>
      <div className="stat-card withoutLoad">
        <div className="stat-icon">
          <BiShield />
        </div>
        <div className="stat-content">
          <div className="stat-number">{withoutLoad}</div>
          <div className="stat-label">Without Load</div>
        </div>
      </div>
      <div className="stat-card recent">
        <div className="stat-icon">
          <BiCalendar />
        </div>
        <div className="stat-content">
          <div className="stat-number">{recent}</div>
          <div className="stat-label">Recent (30 days)</div>
        </div>
      </div>
    </div>
  );
};

// Stability Date Modal
const StabilityDateModal = ({ onClose, onUpdate, currentDate }) => {
  const [stabilityDate, setStabilityDate] = useState(currentDate || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!stabilityDate) {
      toast.error('Please select a stability date');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(stabilityDate);
      toast.success('Stability date updated successfully');
    } catch (error) {
      toast.error('Failed to update stability date');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Update Stability Date">
      <div className="stability-date-modal">
        <div className="form-group">
          <label>Stability Date:</label>
          <input
            type="date"
            value={stabilityDate}
            onChange={(e) => setStabilityDate(e.target.value)}
            className="form-control"
            required
          />
          <small className="text-gray-500">
            Renewal date will be automatically calculated (5 years after stability date)
          </small>
        </div>

        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Main Stability Management Component
const StabilityManagement = ({ searchQuery = "" }) => {
  const [stabilityRecords, setStabilityRecords] = useState([]);
  const [filteredStabilityRecords, setFilteredStabilityRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedStability, setSelectedStability] = useState(null);
  const [stabilityManagers, setStabilityManagers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();

  // Handle search when searchQuery changes
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      handleSearchStabilityRecords(searchQuery);
    } else {
      setFilteredStabilityRecords(stabilityRecords);
    }
  }, [searchQuery, stabilityRecords]);

  const handleSearchStabilityRecords = async (query) => {
    try {
      const response = await stabilityManagementAPI.searchStabilityRecords(query);
      if (response.success) {
        setFilteredStabilityRecords(response.data);
      }
    } catch (error) {
      console.error('Error searching stability records:', error);
      // Fallback to local search
      const filtered = stabilityRecords.filter(record => 
        record.factoryQuotation?.companyName?.toLowerCase().includes(query.toLowerCase()) ||
        record.status?.toLowerCase().includes(query.toLowerCase()) ||
        record.stabilityManager?.username?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStabilityRecords(filtered);
    }
  };

  useEffect(() => {
    fetchStabilityManagementRecords();
    fetchStabilityStatistics();
  }, []);

  const fetchStabilityManagementRecords = async () => {
    setLoading(true);
    try {
      const response = await stabilityManagementAPI.getAllStabilityManagement();
      console.log('Stability management API response:', response);
      if (response.success) {
        console.log('Stability management records:', response.data);
        setStabilityRecords(response.data);
        setError(null);
      } else {
        setError("Failed to fetch stability management records");
      }
    } catch (err) {
      console.error("Error fetching stability management records:", err);
      setError("Failed to fetch stability management records");
    } finally {
      setLoading(false);
    }
  };

  const fetchStabilityStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await stabilityManagementAPI.getStatistics();
      if (response && response.data) {
        setStatistics(response.data);
      } else {
        console.error("Failed to fetch stability management statistics:", response);
        setStatistics({
          total: 0,
          stability: 0,
          submit: 0,
          approved: 0,
          rejected: 0,
          withLoad: 0,
          withoutLoad: 0,
          recent: 0
        });
      }
    } catch (error) {
      console.error("Error fetching stability management statistics:", error);
      setStatistics({
        total: 0,
        stability: 0,
        submit: 0,
        approved: 0,
        rejected: 0,
        withLoad: 0,
        withoutLoad: 0,
        recent: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleStatusChange = async (stabilityId, newStatus) => {
    try {
      const currentStability = stabilityRecords.find(s => s.id === stabilityId);
      
      if (newStatus === 'Approved') {
        // Show upload modal for approval
        setSelectedStability(currentStability);
        setShowFileUploadModal(true);
      } else if (newStatus === 'Reject') {
        // Show reject modal
        setSelectedStability(currentStability);
        setShowRejectModal(true);
      } else if (newStatus === 'submit') {
        // Submit stability using the new API
        const response = await stabilityManagementAPI.updateStabilityStatus(stabilityId, { status: 'submit' });
        if (response.success) {
          toast.success('Stability submitted successfully');
          await fetchStabilityManagementRecords();
        }
      } else if (newStatus === 'stability') {
        // Update status to stability
        const response = await stabilityManagementAPI.updateStabilityStatus(stabilityId, { status: 'stability' });
        if (response.success) {
          toast.success('Stability status updated successfully');
          await fetchStabilityManagementRecords();
        }
      }
    } catch (error) {
      toast.error('Failed to update stability status');
    }
  };

  const handleUploadFiles = async (files, stabilityDate) => {
    if (!selectedStability) return;
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // First update the status with stability date
      await stabilityManagementAPI.updateStabilityStatus(selectedStability.id, {
        status: 'Approved',
        stability_date: stabilityDate
      });

      // Then upload the files
      const response = await stabilityManagementAPI.uploadStabilityFiles(selectedStability.id, formData);
      if (response.success) {
        toast.success('Files uploaded and stability approved successfully');
        await fetchStabilityManagementRecords();
        setShowFileUploadModal(false);
        setSelectedStability(null);
      }
    } catch (error) {
      toast.error('Failed to upload files');
    }
  };

  const handleRejectStability = async (remarks) => {
    if (!selectedStability) return;
    
    try {
      const response = await stabilityManagementAPI.updateStabilityStatus(selectedStability.id, {
        status: 'Reject',
        remarks: remarks
      });
      if (response.success) {
        toast.success('Stability rejected successfully');
        await fetchStabilityManagementRecords();
        setShowRejectModal(false);
        setSelectedStability(null);
      }
    } catch (error) {
      toast.error('Failed to reject stability');
    }
  };

  const handleUpdateStabilityDates = async (stabilityDate) => {
    try {
      await stabilityManagementAPI.updateStabilityDates(selectedStability.id, {
        stability_date: stabilityDate
      });
      
      setShowDateModal(false);
      setSelectedStability(null);
      fetchStabilityManagementRecords();
    } catch (error) {
      console.error('Error updating stability dates:', error);
      throw error;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'stability':
        return 'status-badge-stability';
      case 'submit':
        return 'status-badge-submit';
      case 'Approved':
        return 'status-badge-approved';
      case 'Reject':
        return 'status-badge-reject';
      default:
        return 'status-badge-maked';
    }
  };

  const getLoadTypeBadgeClass = (loadType) => {
    switch (loadType) {
      case 'with_load':
        return 'load-badge-with';
      case 'without_load':
        return 'load-badge-without';
      default:
        return 'load-badge-default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const columns = [
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index) => index + 1,
    },
    {
      key: "quotation",
      label: "Company Details",
      sortable: true,
      render: (_, record) => (
        <div>
          <div className="text-sm text-gray-500"><strong>Name:</strong>{record.factoryQuotation?.companyName || "-"}</div>
          <div className="text-sm"><strong>Address:</strong> {record.factoryQuotation?.companyAddress || "-"}</div>
          <div className="text-sm"><strong>Email:</strong> {record.factoryQuotation?.email || "-"}</div>
          <div className="text-sm"><strong>Phone:</strong> {record.factoryQuotation?.phone || "-"}</div>
        </div>
      ),
    },
    {
      key: "loadType",
      label: "Load Type",
      sortable: true,
      render: (_, record) => (
        <span className={`load-badge ${getLoadTypeBadgeClass(record.load_type)}`}>
          {record.load_type === 'with_load' ? 'With Load' : 'Without Load'}
        </span>
      ),
    },
    {
      key: "status",
      label: "Stability Status",
      sortable: true,
      render: (_, record) => (
        <select
          value={record.status}
          onChange={(e) => handleStatusChange(record.id, e.target.value)}
          className={`status-badge-dropdown ${getStatusBadgeClass(record.status)}`}
        >
          <option value="stability">Stability</option>
          <option value="submit">Submit</option>
          <option value="Approved">Approved</option>
          <option value="Reject">Reject</option>
        </select>
      ),
    },
    {
      key: "assignedDate",
      label: "Assigned Date",
      sortable: true,
      render: (_, record) => {
        const date = record.created_at || record.createdAt;
        return (
          <div className="flex items-center gap-1">
            <BiCalendar />
            {date ? formatDate(date) : 'No date'}
          </div>
        );
      },
    },
    {
      key: "submittedDate",
      label: "Submitted Date",
      sortable: true,
      render: (_, record) => (
        record.submitted_at ? (
          <div className="flex items-center gap-1">
            <BiCalendar />
            {formatDate(record.submitted_at)}
          </div>
        ) : "-"
      ),
    },
    {
      key: "reviewedDate",
      label: "Reviewed Date",
      sortable: true,
      render: (_, record) => (
        record.reviewed_at ? (
          <div className="flex items-center gap-1">
            <BiCalendar />
            {formatDate(record.reviewed_at)}
          </div>
        ) : "-"
      ),
    },
    {
      key: "stabilityDate",
      label: "Stability Date",
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.stability_date ? (
            <div className="flex items-center gap-1">
              <BiCalendar />
              {formatDate(record.stability_date)}
            </div>
          ) : (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSelectedStability(record);
                setShowDateModal(true);
              }}
              icon={<BiEdit />}
            >
              Set Date
            </Button>
          )}
        </div>
      ),
    },
    {
      key: "renewalDate",
      label: "Renewal Date",
      sortable: true,
      render: (_, record) => (
        record.renewal_date ? (
          <div className="flex items-center gap-1">
            <BiCalendar />
            {formatDate(record.renewal_date)}
          </div>
        ) : "-"
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <DocumentDownload 
            system="stability-management" 
            recordId={record.id}
            buttonText="Download"
            buttonClass="document-download-btn btn-outline-secondary btn-sm"
            filePath={record.upload_option ? `/uploads/stability_management/${record.upload_option}` : null}
            fileName={record.upload_option || 'stability-document.pdf'}
          />
        </div>
      ),
    },
  ];

  const filteredRecords = React.useMemo(() => {
    return filteredStabilityRecords;
  }, [filteredStabilityRecords]);

  return (
    <div className="compliance-container">
      <div className="compliance-content">
        <div className="compliance-header">
          <h1 className="compliance-title">Stability Management</h1>
        </div>

        {error && (
          <div className="compliance-error">
            <BiX className="inline mr-2" /> {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="statistics-section">
          <h2 className="statistics-title">Stability Management Statistics</h2>
          <StatisticsCards statistics={statistics} loading={statsLoading} />
        </div>

        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={filteredRecords}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>

      {showFileUploadModal && (
        <FileUploadModal
          onClose={() => {
            setShowFileUploadModal(false);
            setSelectedStability(null);
          }}
          onUpload={handleUploadFiles}
        />
      )}

      {showRejectModal && (
        <RejectModal
          onClose={() => {
            setShowRejectModal(false);
            setSelectedStability(null);
          }}
          onReject={handleRejectStability}
        />
      )}

      {showDateModal && (
        <StabilityDateModal
          onClose={() => {
            setShowDateModal(false);
            setSelectedStability(null);
          }}
          onUpdate={handleUpdateStabilityDates}
          currentDate={selectedStability?.stability_date}
        />
      )}
    </div>
  );
}

export default StabilityManagement; 