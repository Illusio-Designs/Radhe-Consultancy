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
import { planManagementAPI } from "../../../services/api";
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
      toast.success('Plan rejected successfully');
    } catch (error) {
      toast.error('Failed to reject plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Reject Plan">
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

function PlanManagement() {
  const [planManagementRecords, setPlanManagementRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { user, userRoles } = useAuth();
  const isPlanManager = userRoles.includes("plan_manager");

  useEffect(() => {
    fetchPlanManagementRecords();
  }, []);

  const fetchPlanManagementRecords = async () => {
    setLoading(true);
    try {
      const response = await planManagementAPI.getAllPlanManagement();
      if (response.success) {
        setPlanManagementRecords(response.data);
        setError(null);
      } else {
        setError("Failed to fetch plan management records");
      }
    } catch (err) {
      console.error("Error fetching plan management records:", err);
      setError("Failed to fetch plan management records");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (planId, newStatus) => {
    try {
      const currentPlan = planManagementRecords.find(p => p.id === planId);
      
      if (newStatus === 'Approved') {
        // Show upload modal for approval
        setSelectedPlan(currentPlan);
        setShowFileUploadModal(true);
      } else if (newStatus === 'Reject') {
        // Show reject modal
        setSelectedPlan(currentPlan);
        setShowRejectModal(true);
      } else if (newStatus === 'submit') {
        // Submit plan using the new API
        const response = await planManagementAPI.updatePlanStatus(planId, { status: 'submit' });
        if (response.success) {
          toast.success('Plan submitted successfully');
          await fetchPlanManagementRecords();
        }
      } else if (newStatus === 'plan') {
        // Update status to plan
        const response = await planManagementAPI.updatePlanStatus(planId, { status: 'plan' });
        if (response.success) {
          toast.success('Plan status updated successfully');
          await fetchPlanManagementRecords();
        }
      }
    } catch (error) {
      toast.error('Failed to update plan status');
    }
  };

  const handleUploadFiles = async (files) => {
    if (!selectedPlan) return;
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await planManagementAPI.uploadPlanFiles(selectedPlan.id, formData);
      if (response.success) {
        toast.success('Files uploaded and plan approved successfully');
        await fetchPlanManagementRecords();
        setShowFileUploadModal(false);
        setSelectedPlan(null);
      }
    } catch (error) {
      toast.error('Failed to upload files');
    }
  };

  const handleRejectPlan = async (remarks) => {
    if (!selectedPlan) return;
    
    try {
      const response = await planManagementAPI.updatePlanStatus(selectedPlan.id, {
        status: 'Reject',
        remarks: remarks
      });
      if (response.success) {
        toast.success('Plan rejected successfully');
        await fetchPlanManagementRecords();
        setShowRejectModal(false);
        setSelectedPlan(null);
      }
    } catch (error) {
      toast.error('Failed to reject plan');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'plan':
        return 'status-badge-plan';
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
      key: "status",
      label: "Plan Status",
      sortable: true,
      render: (_, record) => (
        <select
          value={record.status}
          onChange={(e) => handleStatusChange(record.id, e.target.value)}
          className={`status-badge-dropdown ${getStatusBadgeClass(record.status)}`}
        >
          <option value="plan">Plan</option>
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
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <BiCalendar />
          {formatDate(record.created_at)}
        </div>
      ),
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
    return planManagementRecords;
  }, [planManagementRecords]);

  return (
    <div className="compliance-container">
      <div className="compliance-content">
        <div className="compliance-header">
          <h1 className="compliance-title">Plan Management</h1>
          <div className="plan-manager-info">
            <BiUser /> Welcome, {user?.username || 'Plan Manager'}
          </div>
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
            setSelectedPlan(null);
          }}
          onUpload={handleUploadFiles}
        />
      )}

      {showRejectModal && (
        <RejectModal
          onClose={() => {
            setShowRejectModal(false);
            setSelectedPlan(null);
          }}
          onReject={handleRejectPlan}
        />
      )}
    </div>
  );
}

export default PlanManagement; 