// This file is now FactoryQuotation.jsx
import React, { useState, useEffect } from "react";
import {
  BiPlus,
  BiEdit,
  BiErrorCircle,
  BiUser,
  BiCheck,
  BiX,
  BiUpload,
  BiFile,
} from "react-icons/bi";
import { factoryQuotationAPI, planManagementAPI, userAPI, stabilityManagementAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import Dropdown from "../../../components/common/Dropdown/Dropdown";
import "../../../styles/pages/dashboard/compliance/Compliance.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../contexts/AuthContext";

// Plan Manager Selection Modal
const PlanManagerSelectionModal = ({ isOpen, onClose, onSelect, quotation }) => {
  const [selectedPlanManager, setSelectedPlanManager] = useState('');
  const [loading, setLoading] = useState(false);
  const [planManagers, setPlanManagers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchPlanManagers();
    }
  }, [isOpen]);

  const fetchPlanManagers = async () => {
    try {
      setLoading(true);
      console.log('Fetching plan managers...');
      
      // Fetch users with Plan_manager role
      const response = await planManagementAPI.getPlanManagers();
      console.log('Plan managers API response:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        setPlanManagers(response.data);
        console.log('Plan managers loaded successfully:', response.data);
      } else {
        console.error('Invalid response format:', response);
        toast.error('Failed to load plan managers - invalid response');
        setPlanManagers([]);
      }
    } catch (error) {
      console.error('Error fetching plan managers:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to load plan managers: ${error.message}`);
      setPlanManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPlanManager) {
      toast.error('Please select a plan manager');
      return;
    }

    setLoading(true);
    try {
      const response = await planManagementAPI.createPlanManagement({
        factory_quotation_id: quotation.id,
        plan_manager_id: selectedPlanManager
      });
      
      if (response.success) {
        toast.success('Plan manager assigned successfully');
        onSelect(selectedPlanManager);
        onClose();
      }
    } catch (error) {
      toast.error('Failed to assign plan manager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Plan Manager">
      <div className="plan-manager-selection-modal">
        <div className="form-group">
          <label>Select Plan Manager:</label>
          <select
            value={selectedPlanManager}
            onChange={(e) => setSelectedPlanManager(e.target.value)}
            className="form-control"
            disabled={loading}
          >
            <option value="">
              {loading ? 'Loading plan managers...' : 'Select Plan Manager'}
            </option>
            {planManagers.map(manager => (
              <option key={manager.user_id} value={manager.user_id}>
                {manager.username} ({manager.email})
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleAssign} variant="contained" disabled={loading}>
            Assign
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const StabilityManagerSelectionModal = ({ isOpen, onClose, onSelect, quotation }) => {
  const [selectedStabilityManager, setSelectedStabilityManager] = useState('');
  const [loading, setLoading] = useState(false);
  const [stabilityManagers, setStabilityManagers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchStabilityManagers();
    }
  }, [isOpen]);

  const fetchStabilityManagers = async () => {
    try {
      const response = await stabilityManagementAPI.getStabilityManagers();
      if (response.success) {
        setStabilityManagers(response.data);
      }
    } catch (error) {
      console.error('Error fetching stability managers:', error);
      toast.error('Failed to fetch stability managers');
    }
  };

  const handleAssign = async () => {
    if (!selectedStabilityManager) {
      toast.error('Please select a stability manager');
      return;
    }
    setLoading(true);
    try {
      // Use the existing stabilityCertificateType from the quotation
      const loadType = quotation.stabilityCertificateType || 'with_load';
      onSelect(selectedStabilityManager, loadType);
      onClose();
    } catch (error) {
      toast.error('Failed to assign stability manager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Stability Manager">
      <div className="stability-manager-selection-modal">
        <div className="form-group">
          <label>Select Stability Manager:</label>
          <select
            value={selectedStabilityManager}
            onChange={(e) => setSelectedStabilityManager(e.target.value)}
            className="form-control"
            disabled={loading}
          >
            <option value="">
              {loading ? 'Loading stability managers...' : 'Select Stability Manager'}
            </option>
            {stabilityManagers.map(manager => (
              <option key={manager.user_id} value={manager.user_id}>
                {manager.username} ({manager.email})
              </option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleAssign} variant="contained" disabled={loading}>
            Assign
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const FactoryQuotationForm = ({ quotation, onClose, onQuotationUpdated }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    phone: "",
    email: "",
    noOfWorkers: "",
    horsePower: "",
    calculatedAmount: 0,
    year: 1,
    stabilityCertificateType: "with load",
    stabilityCertificateAmount: 0,
    administrationCharge: 0,
    consultancyFees: 0,
    planCharge: 0,
    totalAmount: 0,
    status: "maked",
  });

  const [calculationOptions, setCalculationOptions] = useState({
    horsePowerOptions: [],
    noOfWorkersOptions: []
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load calculation options when component mounts
    const loadCalculationOptions = async () => {
      try {
        const response = await factoryQuotationAPI.getCalculationOptions();
        if (response && response.data) {
          setCalculationOptions(response.data);
        }
      } catch (err) {
        console.error('Error loading calculation options:', err);
      }
    };
    
    loadCalculationOptions();
  }, []);

  useEffect(() => {
    if (quotation) {
      setFormData({
        companyName: quotation.companyName || "",
        companyAddress: quotation.companyAddress || "",
        phone: quotation.phone || "",
        email: quotation.email || "",
        noOfWorkers: quotation.noOfWorkers || "",
        horsePower: quotation.horsePower || "",
        calculatedAmount: quotation.calculatedAmount || 0,
        year: quotation.year || 1,
        stabilityCertificateType: quotation.stabilityCertificateType || "with load",
        stabilityCertificateAmount: quotation.stabilityCertificateAmount || 0,
        administrationCharge: quotation.administrationCharge || 0,
        consultancyFees: quotation.consultancyFees || 0,
        planCharge: quotation.planCharge || 0,
        totalAmount: quotation.totalAmount || 0,
        status: quotation.status || "maked",
      });
    }
  }, [quotation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-calculate when horse power or number of workers changes
    if (name === 'horsePower' || name === 'noOfWorkers') {
      const newHorsePower = name === 'horsePower' ? value : formData.horsePower;
      const newNoOfWorkers = name === 'noOfWorkers' ? value : formData.noOfWorkers;
      
      if (newHorsePower && newNoOfWorkers) {
        calculateAmount(newHorsePower, newNoOfWorkers);
      }
    }
  };

  const calculateAmount = async (horsePower, noOfWorkers) => {
    try {
      const response = await factoryQuotationAPI.calculateAmount(horsePower, noOfWorkers);
      if (response && response.data && response.data.calculatedAmount) {
        setFormData(prev => ({
          ...prev,
          calculatedAmount: response.data.calculatedAmount
        }));
      }
    } catch (err) {
      console.error('Error calculating amount:', err);
    }
  };

  const calculateTotal = () => {
    const calculated = parseFloat(formData.calculatedAmount) || 0;
    const yearMultiplier = parseFloat(formData.year) || 1;
    const stability = parseFloat(formData.stabilityCertificateAmount) || 0;
    const admin = parseFloat(formData.administrationCharge) || 0;
    const consultancy = parseFloat(formData.consultancyFees) || 0;
    const plan = parseFloat(formData.planCharge) || 0;
    
    // Calculate: (calculated amount × year multiplier) + other charges
    return (calculated * yearMultiplier) + stability + admin + consultancy + plan;
  };

  useEffect(() => {
    const total = calculateTotal();
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [formData.calculatedAmount, formData.year, formData.stabilityCertificateAmount, formData.administrationCharge, formData.consultancyFees, formData.planCharge]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("\n=== [Factory Quotation] Form Submit Started ===");
    console.log("Form Values:", formData);

    setLoading(true);
    setError("");

    // Validate required fields
    const requiredFields = {
      companyName: "Company Name",
      companyAddress: "Company Address",
      phone: "Phone",
      email: "Email",
      noOfWorkers: "Number of Workers",
      horsePower: "Horse Power",
      calculatedAmount: "Calculated Amount",
      year: "Year",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      console.error("[Factory Quotation] Missing required fields:", missingFields);
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      let response;
      if (quotation) {
        console.log("\n[Factory Quotation] Updating quotation:", quotation.id);
        response = await factoryQuotationAPI.updateQuotation(quotation.id, formData);
        toast.success("Factory quotation updated successfully!");
      } else {
        console.log("\n[Factory Quotation] Creating new quotation");
        response = await factoryQuotationAPI.createQuotation(formData);
        toast.success("Factory quotation created successfully!");
      }

      onQuotationUpdated();
    } catch (err) {
      console.error("\n[Factory Quotation] Error submitting form:", err);
      const errorMessage = err.response?.data?.message || "Failed to save factory quotation";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.log("=== [Factory Quotation] Form Submit Ended ===\n");
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="compliance-form">
        <div className="compliance-form-grid">
          <div className="compliance-form-group">
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company Name"
              className="compliance-form-input"
              required
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="text"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              placeholder="Company Address"
              className="compliance-form-input"
              required
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="compliance-form-input"
              required
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="compliance-form-input"
              required
            />
          </div>

                    <div className="compliance-form-group">
            <select
              name="noOfWorkers"
              value={formData.noOfWorkers}
              onChange={handleChange}
              className="compliance-form-input"
              required
            >
        <option value="">Select No. of Workers</option>
              {calculationOptions.noOfWorkersOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
          </div>

          <div className="compliance-form-group">
            <select
              name="horsePower"
              value={formData.horsePower}
              onChange={handleChange}
              className="compliance-form-input"
              required
            >
        <option value="">Select Horse Power</option>
              {calculationOptions.horsePowerOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="calculatedAmount"
              value={formData.calculatedAmount}
              onChange={handleChange}
              placeholder="Calculated Amount (Auto-calculated)"
              className="compliance-form-input"
              required
              min="0"
              step="0.01"
              readOnly
            />
            <small className="text-gray-600 text-xs mt-1">
              Auto-calculated based on Horse Power and Number of Workers
            </small>
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="Number of Years (1, 2, 3...)"
              className="compliance-form-input"
              required
              min="1"
              max="10"
            />
            <small className="text-gray-600 text-xs mt-1">
              Number of years to multiply with calculated amount
            </small>
          </div>

          <div className="compliance-form-group">
            <select
              name="stabilityCertificateType"
              value={formData.stabilityCertificateType}
              onChange={handleChange}
              className="compliance-form-input"
              required
            >
        <option value="with load">With Load</option>
        <option value="without load">Without Load</option>
      </select>
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="stabilityCertificateAmount"
              value={formData.stabilityCertificateAmount}
              onChange={handleChange}
              placeholder="Stability Certificate Amount"
              className="compliance-form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="administrationCharge"
              value={formData.administrationCharge}
              onChange={handleChange}
              placeholder="Administration Charge"
              className="compliance-form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="consultancyFees"
              value={formData.consultancyFees}
              onChange={handleChange}
              placeholder="Consultancy Fees"
              className="compliance-form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="planCharge"
              value={formData.planCharge}
              onChange={handleChange}
              placeholder="Plan Charge"
              className="compliance-form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="compliance-form-group">
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              className="compliance-form-input"
              placeholder="Total Amount"
              readOnly
            />
          </div>

          <div className="compliance-form-group">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="compliance-form-input"
              required
            >
        {["maked", "approved", "plan", "stability", "application", "renewal"].map((opt) => (
          <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
        ))}
      </select>
          </div>
        </div>

        {error && (
          <div className="compliance-form-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}

        <div className="compliance-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {quotation ? "Update" : "Create"}
          </Button>
      </div>
    </form>
    </>
  );
};

function FactoryQuotation({ searchQuery = "" }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [showPlanManagerModal, setShowPlanManagerModal] = useState(false);
  const [showStabilityManagerModal, setShowStabilityManagerModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const { user, userRoles } = useAuth();
  const isAdmin = userRoles.includes("admin");
  const isComplianceManager = userRoles.includes("compliance_manager");
  const canEdit = isAdmin || isComplianceManager;

  useEffect(() => {
    console.log("Factory Quotation component mounted");
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await factoryQuotationAPI.getAllQuotations();
        console.log("Factory Quotation API response:", response);

        if (response && response.data && Array.isArray(response.data)) {
          setQuotations(response.data);
          setError(null);
        } else if (response && Array.isArray(response)) {
          setQuotations(response);
          setError(null);
        } else {
          setError("Invalid data format received from server");
          setQuotations([]);
        }
      } catch (err) {
        console.error("Error fetching factory quotations:", err);
        setError("Failed to fetch factory quotations");
        setQuotations([]);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    if (searchQuery && searchQuery.trim() !== "") {
      handleSearchQuotations(searchQuery);
    } else {
      fetchData();
    }
  }, [searchQuery]);

  const handleSearchQuotations = async (query) => {
    try {
      console.log("Searching factory quotations with query:", query);
      setLoading(true);
      // Note: Backend doesn't have search endpoint yet, so we'll filter client-side
      const response = await factoryQuotationAPI.getAllQuotations();
      
      if (response && response.data && Array.isArray(response.data)) {
        const filtered = response.data.filter(quotation => 
          quotation.companyName?.toLowerCase().includes(query.toLowerCase()) ||
          quotation.email?.toLowerCase().includes(query.toLowerCase()) ||
          quotation.phone?.includes(query)
        );
        setQuotations(filtered);
        setError(null);
      } else {
        setError("Invalid data format received from server");
        setQuotations([]);
      }
    } catch (err) {
      console.error("Error searching factory quotations:", err);
      setError("Failed to search factory quotations");
      setQuotations([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const fetchQuotations = async () => {
    try {
      console.log("Fetching factory quotations...");
      setLoading(true);
      const response = await factoryQuotationAPI.getAllQuotations();
      console.log("Factory Quotation API response:", response);

      if (response && response.data && Array.isArray(response.data)) {
        setQuotations(response.data);
      setError(null);
      } else {
        console.error("Invalid response format:", response);
        setError("Invalid data format received from server");
        setQuotations([]);
      }
    } catch (err) {
      console.error("Error fetching factory quotations:", err);
      setError("Failed to fetch factory quotations");
      setQuotations([]);
    } finally {
      setTimeout(() => {
      setLoading(false);
      }, 2000);
    }
  };



  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setShowModal(true);
  };

  const handleModalClose = () => {
    console.log("Modal closing");
    setSelectedQuotation(null);
    setShowModal(false);
  };

  const handleQuotationUpdated = async () => {
    console.log("Factory quotation updated, refreshing list");
    await fetchQuotations();
    handleModalClose();
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      if (newStatus === 'plan') {
        // Show plan manager selection modal
        const quotation = quotations.find(q => q.id === quotationId);
        setSelectedQuotation(quotation);
        setShowPlanManagerModal(true);
        return;
      }

      if (newStatus === 'stability') {
        // Show stability manager selection modal
        const quotation = quotations.find(q => q.id === quotationId);
        setSelectedQuotation(quotation);
        setShowStabilityManagerModal(true);
        return;
      }

      const response = await factoryQuotationAPI.updateStatus(quotationId, { status: newStatus });
      if (response.success) {
        toast.success(`Status updated to ${newStatus} successfully`);
        await fetchQuotations();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePlanManagerSelect = async (planManagerId) => {
    try {
      const response = await planManagementAPI.createPlanManagement({
        factory_quotation_id: selectedQuotation.id,
        plan_manager_id: planManagerId
      });
      
      if (response.success) {
        toast.success('Plan manager assigned successfully');
        await fetchQuotations();
      }
    } catch (error) {
      toast.error('Failed to assign plan manager');
    }
  };

  const handleStabilityManagerSelect = async (stabilityManagerId, loadType) => {
    try {
      const response = await stabilityManagementAPI.createStabilityManagement({
        factory_quotation_id: selectedQuotation.id,
        stability_manager_id: stabilityManagerId,
        load_type: loadType
      });
      
      if (response.success) {
        toast.success('Stability manager assigned successfully');
        await fetchQuotations();
      }
    } catch (error) {
      toast.error('Failed to assign stability manager');
    }
  };

  const columns = [
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index) => index + 1,
    },
    {
      key: "companyName",
      label: "Company Name",
      sortable: true,
      render: (_, quotation) => quotation.companyName || "-",
    },
    {
      key: "companyAddress",
      label: "Address",
      sortable: true,
      render: (_, quotation) => quotation.companyAddress || "-",
    },
    {
      key: "contact",
      label: "Contact Details",
      sortable: true,
      render: (_, quotation) => (
        <div>
          <div>{quotation.phone || "-"}</div>
          <div className="text-sm text-gray-600">{quotation.email || "-"}</div>
        </div>
      ),
    },
    {
      key: "workers",
      label: "Workers",
      sortable: true,
      render: (_, quotation) => quotation.noOfWorkers || "-",
    },
    {
      key: "horsePower",
      label: "Horse Power",
      sortable: true,
      render: (_, quotation) => quotation.horsePower || "-",
    },
    {
      key: "calculatedAmount",
      label: "Base Amount",
      sortable: true,
      render: (_, quotation) => `₹${quotation.calculatedAmount?.toLocaleString() || "0"}`,
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      sortable: true,
      render: (_, quotation) => `₹${quotation.totalAmount?.toLocaleString() || "0"}`,
    },
    {
      key: "year",
      label: "Years",
      sortable: true,
      render: (_, quotation) => `${quotation.year || 1} year${quotation.year > 1 ? 's' : ''}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (_, quotation) => {
        const statusClass =
          quotation.status === "approved"
            ? "status-badge-approved"
            : quotation.status === "maked"
            ? "status-badge-maked"
            : quotation.status === "plan"
            ? "status-badge-plan"
            : quotation.status === "stability"
            ? "status-badge-stability"
            : quotation.status === "application"
            ? "status-badge-application"
            : quotation.status === "renewal"
            ? "status-badge-renewal"
            : "status-badge-maked";
        return canEdit ? (
          <select
            value={quotation.status || "maked"}
            onChange={(e) => handleStatusChange(quotation.id, e.target.value)}
            className={`status-badge-dropdown ${statusClass}`}
          >
            <option value="maked">Maked</option>
            <option value="approved">Approved</option>
            <option value="plan">Plan</option>
            <option value="stability">Stability</option>
            <option value="application">Application</option>
            <option value="renewal">Renewal</option>
          </select>
        ) : (
          <span className={`status-badge-dropdown ${statusClass}`}>{
            quotation.status?.charAt(0).toUpperCase() + quotation.status?.slice(1) || "-"
          }</span>
        );
      },
    },
    {
      key: "planStatus",
      label: "Plan Status",
      sortable: true,
      render: (_, quotation) => {
        const planStatus = quotation.planManagement?.status;
        if (!planStatus) {
          return "-";
        }
        
        const planStatusClass = 
          planStatus === 'plan' ? 'status-badge-plan' :
          planStatus === 'submit' ? 'status-badge-submit' :
          planStatus === 'Approved' ? 'status-badge-approved' :
          planStatus === 'Reject' ? 'status-badge-reject' :
          'status-badge-maked';
        
        return (
          <span className={`status-badge-dropdown ${planStatusClass}`}>
            {planStatus}
          </span>
        );
      },
    },
    {
      key: "stabilityStatus",
      label: "Stability Status",
      sortable: true,
      render: (_, quotation) => {
        const stabilityStatus = quotation.stabilityManagement?.status;
        if (!stabilityStatus) {
          return "-";
        }
        
        const stabilityStatusClass = 
          stabilityStatus === 'stability' ? 'status-badge-stability' :
          stabilityStatus === 'submit' ? 'status-badge-submit' :
          stabilityStatus === 'Approved' ? 'status-badge-approved' :
          stabilityStatus === 'Reject' ? 'status-badge-reject' :
          'status-badge-maked';
        
        return (
          <span className={`status-badge-dropdown ${stabilityStatusClass}`}>
            {stabilityStatus}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, quotation) => (
        <div className="insurance-actions">
          <ActionButton
            onClick={() => handleEdit(quotation)}
            variant="secondary"
            size="small"
            disabled={!canEdit}
          >
            <BiEdit />
          </ActionButton>
        </div>
      ),
    },
  ];

  const filteredQuotations = React.useMemo(() => {
    let filtered = quotations;
    
    // Apply status filtering
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }
    
    return filtered;
  }, [quotations, statusFilter]);

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "maked", label: "Maked" },
    { value: "approved", label: "Approved" },
    { value: "plan", label: "Plan" },
    { value: "stability", label: "Stability" },
    { value: "application", label: "Application" },
    { value: "renewal", label: "Renewal" },
  ];

  return (
    <div className="compliance-container">
      <div className="compliance-content">
      <div className="compliance-header">
        <h1 className="compliance-title">Factory Quotation</h1>
          <div className="list-container">
        {canEdit && (
              <Button
                variant="contained"
                onClick={() => setShowModal(true)}
                icon={<BiPlus />}
              >
            Add Quotation
          </Button>
        )}
            <div className="dashboard-header-dropdown-container">
              <Dropdown
                options={statusOptions}
                value={statusOptions.find((opt) => opt.value === statusFilter)}
                onChange={(option) =>
                  setStatusFilter(option ? option.value : "all")
                }
                placeholder="Filter by Status"
              />
            </div>
          </div>
      </div>

      {error && (
        <div className="compliance-error">
          <BiErrorCircle className="inline mr-2" /> {error}
        </div>
      )}

      {loading ? (
        <Loader size="large" color="primary" />
      ) : (
          <TableWithControl
            data={filteredQuotations}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedQuotation ? "Edit Factory Quotation" : "Add New Factory Quotation"}
      >
        <FactoryQuotationForm
          quotation={selectedQuotation}
          onClose={handleModalClose}
          onQuotationUpdated={handleQuotationUpdated}
        />
      </Modal>
      <PlanManagerSelectionModal
        isOpen={showPlanManagerModal}
        onClose={() => setShowPlanManagerModal(false)}
        onSelect={handlePlanManagerSelect}
        quotation={selectedQuotation}
      />
      <StabilityManagerSelectionModal
        isOpen={showStabilityManagerModal}
        onClose={() => setShowStabilityManagerModal(false)}
        onSelect={handleStabilityManagerSelect}
        quotation={selectedQuotation}
      />
    </div>
  );
}

export default FactoryQuotation;
