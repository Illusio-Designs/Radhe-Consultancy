import React, { useState, useEffect } from "react";
import {
  BiCheck,
  BiX,
  BiUpload,
  BiFile,
  BiUser,
  BiCalendar,
  BiEdit,
} from "react-icons/bi";
import { stabilityManagementAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/compliance/Compliance.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../contexts/AuthContext";

// File Upload Modal
const FileUploadModal = ({ onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
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

    setLoading(true);
    try {
      await onUpload(files);
      toast.success('Files uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Upload Files">
      <div className="file-upload-modal">
        <div className="form-group">
          <label>Select Files:</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="form-control"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
          />
          <small className="text-gray-500">
            Allowed file types: PDF, Word, Excel, Images, Text (Max 10MB each, up to 10 files)
          </small>
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

        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleUpload} variant="contained" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
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
          <label>Rejection Remarks:</label>
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
            Reject
          </Button>
        </div>
      </div>
    </Modal>
  );
};

function StabilityManagement() {
  const [stabilityManagementRecords, setStabilityManagementRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedStability, setSelectedStability] = useState(null);
  const { user, userRoles } = useAuth();
  const isStabilityManager = userRoles.includes("stability_manager");

  useEffect(() => {
    fetchStabilityManagementRecords();
  }, []);

  const fetchStabilityManagementRecords = async () => {
    setLoading(true);
    try {
      const response = await stabilityManagementAPI.getAllStabilityManagement();
      console.log('Stability management API response:', response);
      if (response.success) {
        console.log('Stability management records:', response.data);
        setStabilityManagementRecords(response.data);
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

  const handleStatusChange = async (stabilityId, newStatus) => {
    try {
      const currentStability = stabilityManagementRecords.find(s => s.id === stabilityId);
      
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

  const handleUploadFiles = async (files) => {
    if (!selectedStability) return;
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

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
  ];

  const filteredRecords = React.useMemo(() => {
    return stabilityManagementRecords;
  }, [stabilityManagementRecords]);

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
    </div>
  );
}

export default StabilityManagement; 