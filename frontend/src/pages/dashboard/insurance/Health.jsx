import React, { useState, useEffect, useMemo } from "react";
import {
  BiPlus,
  BiEdit,
  BiTrash,
  BiErrorCircle,
  BiUpload,
  BiShield,
  BiTrendingUp,
  BiCalendar,
  BiDownload,
} from "react-icons/bi";
import { healthPolicyAPI, insuranceCompanyAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import Select, { components } from "react-select";
import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { toast } from "react-toastify";
import "react-phone-number-input/style.css";
import "../../../styles/pages/dashboard/insurance/Insurance.css";
import "../../../styles/components/StatCards.css";
import { useAuth } from "../../../contexts/AuthContext";
import DocumentDownload from "../../../components/common/DocumentDownload/DocumentDownload";

// --- CreateInsuranceCompanyModal (copied from Vehicle.jsx) ---
const CreateInsuranceCompanyModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError("Please enter a company name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const created = await insuranceCompanyAPI.createCompany({
        name: form.name,
      });
      toast.success("Insurance company created!");
      onCreated(created);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to create insurance company";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Insurance Company">
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Enter company name"
        required
        className="insurance-form-input"
      />
      {error && (
        <div className="insurance-error" style={{ marginTop: 8 }}>
          {error}
        </div>
      )}
      <div className="insurance-form-actions">
        <Button type="button" variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          disabled={loading}
          onClick={handleCreate}
        >
          {loading ? "Creating..." : "Create"}
        </Button>
      </div>
    </Modal>
  );
};

const PolicyForm = ({ policy, onClose, onPolicyUpdated }) => {
  const [formData, setFormData] = useState({
    businessType: "",
    customerType: "",
    insuranceCompanyId: "",
    companyId: "",
    consumerId: "",
    policyNumber: "",
    email: "",
    mobileNumber: "",
    policyStartDate: "",
    policyEndDate: "",
    planName: "",
    medicalCover: "",
    netPremium: "",
    remarks: "",
    proposer_name: "",
  });
  const [files, setFiles] = useState({ policyDocument: null });
  const [fileNames, setFileNames] = useState({ policyDocument: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [gst, setGst] = useState(0);
  const [grossPremium, setGrossPremium] = useState(0);
  const [showCreateICModal, setShowCreateICModal] = useState(false);
  const [newICId, setNewICId] = useState(null);

  useEffect(() => {
    if (policy) {
      setFormData({
        businessType: policy.business_type || "",
        customerType: policy.customer_type || "",
        insuranceCompanyId: policy.insurance_company_id || "",
        companyId: policy.company_id || "",
        consumerId: policy.consumer_id || "",
        policyNumber: policy.policy_number || "",
        email: policy.email || "",
        mobileNumber: policy.mobile_number || "",
        policyStartDate: policy.policy_start_date
          ? policy.policy_start_date.slice(0, 10)
          : "",
        policyEndDate: policy.policy_end_date
          ? policy.policy_end_date.slice(0, 10)
          : "",
        planName: policy.plan_name || "",
        medicalCover: policy.medical_cover || "",
        netPremium: policy.net_premium || "",
        remarks: policy.remarks || "",
        proposer_name: policy.proposer_name || "",
      });
      setFileNames({ policyDocument: policy.policy_document_path || "" });
    }
  }, [policy]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const companiesResponse = await healthPolicyAPI.getActiveCompanies();
        setCompanies(companiesResponse);
        const consumersResponse = await healthPolicyAPI.getActiveConsumers();
        setConsumers(consumersResponse);
        const options = [
          {
            label: "Companies",
            options: companiesResponse.map((company) => ({
              value: `company_${company.company_id}`,
              label: company.company_name,
              type: "company",
              data: company,
            })),
          },
          {
            label: "Consumers",
            options: consumersResponse.map((consumer) => ({
              value: `consumer_${consumer.consumer_id}`,
              label: consumer.name,
              type: "consumer",
              data: consumer,
            })),
          },
        ];
        setCombinedOptions(options);
      } catch (err) {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchICs = async () => {
      try {
        const data = await insuranceCompanyAPI.getAllCompanies();
        const companies = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.companies)
          ? data.companies
          : [];
        setInsuranceCompanies(companies);
        if (newICId) {
          setFormData((prev) => ({ ...prev, insuranceCompanyId: newICId }));
          setNewICId(null);
        }
      } catch {
        setInsuranceCompanies([]);
      }
    };
    fetchICs();
  }, [showCreateICModal]);

  useEffect(() => {
    const net = parseFloat(formData.netPremium) || 0;
    const gstVal = +(net * 0.18).toFixed(2);
    setGst(gstVal);
    setGrossPremium(+(net + gstVal).toFixed(2));
  }, [formData.netPremium]);

  const handleHolderChange = (option) => {
    console.log("\n=== [Health] Holder Change ===");
    console.log("Selected Option:", option);

    if (!option) {
      console.log("Clearing holder selection");
      setFormData((prev) => ({
        ...prev,
        companyId: null,
        consumerId: null,
        email: "",
        mobileNumber: "",
        proposer_name: "",
        customerType: "",
      }));
      return;
    }

    const { type, data } = option;
    console.log("Holder Type:", type);
    console.log("Holder Data:", data);

    if (type === "company") {
      console.log("Setting company holder");
      setFormData((prev) => ({
        ...prev,
        companyId: Number(data.company_id),
        consumerId: null, // Explicitly set to null
        email: data.company_email,
        mobileNumber: data.contact_number,
        proposer_name: data.company_name,
        customerType: "Organisation",
      }));
    } else if (type === "consumer") {
      console.log("Setting consumer holder");
      setFormData((prev) => ({
        ...prev,
        companyId: null, // Explicitly set to null
        consumerId: Number(data.consumer_id),
        email: data.email,
        mobileNumber: data.phone_number,
        proposer_name: data.name,
        customerType: "Individual",
      }));
    }

    // Log the updated form data
    console.log("Updated Form Data:", {
      companyId: type === "company" ? Number(data.company_id) : null,
      consumerId: type === "consumer" ? Number(data.consumer_id) : null,
      customerType: type === "company" ? "Organisation" : "Individual",
    });

    console.log("=== [Health] Holder Change Complete ===\n");
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF and Word documents are allowed");
        e.target.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        e.target.value = null;
        return;
      }
      setFiles((prev) => ({ ...prev, [type]: file }));
      setFileNames((prev) => ({ ...prev, [type]: file.name }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, mobileNumber: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("\n=== [Health] Form Submit Started ===");
    console.log("Form Values:", formData);
    console.log("Selected File:", files.policyDocument);

    setLoading(true);
    setError("");

    // Validate required fields
    const requiredFields = {
      businessType: "Business Type",
      customerType: "Customer Type",
      insuranceCompanyId: "Insurance Company",
      policyNumber: "Policy Number",
      email: "Email",
      mobileNumber: "Mobile Number",
      policyStartDate: "Policy Start Date",
      policyEndDate: "Policy End Date",
      planName: "Plan Name",
      medicalCover: "Medical Cover",
      netPremium: "Net Premium",
      proposer_name: "Proposer Name",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      const msg = `Missing required fields: ${missingFields.join(", ")}`;
      toast.error(msg);
      setLoading(false);
      return;
    }

    // Validate that either companyId or consumerId is provided, but not both
    const hasCompanyId =
      formData.companyId &&
      formData.companyId !== "null" &&
      formData.companyId !== "";
    const hasConsumerId =
      formData.consumerId &&
      formData.consumerId !== "null" &&
      formData.consumerId !== "";

    console.log("[Health] ID Validation:", {
      companyId: formData.companyId,
      consumerId: formData.consumerId,
      hasCompanyId,
      hasConsumerId,
    });

    if (!hasCompanyId && !hasConsumerId) {
      console.error("[Health] Neither company nor consumer selected");
      setError("Please select either a company or a consumer");
      setLoading(false);
      return;
    }

    if (hasCompanyId && hasConsumerId) {
      console.error("[Health] Both company and consumer selected");
      setError("Please select either a company or a consumer, not both");
      setLoading(false);
      return;
    }

    // Validate file
    if (!policy && !files.policyDocument) {
      console.error("[Health] No file selected");
      setError("Policy document is required for new policies");
      setLoading(false);
      return;
    }

    // Validate dates
    const startDate = new Date(formData.policyStartDate);
    const endDate = new Date(formData.policyEndDate);
    if (endDate <= startDate) {
      console.error("[Health] Invalid date range:", { startDate, endDate });
      setError("Policy end date must be after start date");
      setLoading(false);
      return;
    }

    // Validate numeric fields
    const numericFields = ["medicalCover", "netPremium"];
    const invalidNumericFields = numericFields.filter((field) => {
      const value = parseFloat(formData[field]);
      return isNaN(value) || value < 0;
    });

    if (invalidNumericFields.length > 0) {
      console.error("[Health] Invalid numeric fields:", invalidNumericFields);
      setError(
        `Please enter valid numbers for: ${invalidNumericFields.join(", ")}`
      );
      setLoading(false);
      return;
    }

    try {
      const sanitizedFormData = { ...formData };

      // Set the appropriate ID based on what was selected
      if (hasCompanyId) {
        sanitizedFormData.companyId = Number(sanitizedFormData.companyId);
        sanitizedFormData.consumerId = null;
      } else {
        sanitizedFormData.consumerId = Number(sanitizedFormData.consumerId);
        sanitizedFormData.companyId = null;
      }

      const submitData = new FormData();

      // Log what we're adding to FormData
      console.log("\n[Health] Preparing FormData:");

      // Add all form fields
      Object.entries(sanitizedFormData).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          value !== "null"
        ) {
          const apiKey = key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`
          );
          submitData.append(apiKey, value);
          console.log(`Adding ${apiKey}:`, value);
        } else {
          console.log(`Skipping ${key} as it's empty or null`);
        }
      });

      // Add calculated fields
      submitData.append("gst", gst.toFixed(2));
      submitData.append("gross_premium", grossPremium.toFixed(2));
      console.log("Adding calculated fields:", {
        gst: gst.toFixed(2),
        gross_premium: grossPremium.toFixed(2),
      });

      // Add file if selected
      if (files.policyDocument) {
        submitData.append(
          "policyDocument",
          files.policyDocument,
          files.policyDocument.name
        );
        console.log("Adding file:", files.policyDocument.name);
      }

      // Log final FormData
      console.log("\n[Health] Final FormData contents:");
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      let response;
      if (policy) {
        console.log("\n[Health] Updating policy:", policy.id);
        response = await healthPolicyAPI.updatePolicy(policy.id, submitData);
        console.log("[Health] Update response:", response);
        toast.success("Policy updated successfully!");
      } else {
        console.log("\n[Health] Creating new policy");
        response = await healthPolicyAPI.createPolicy(submitData);
        console.log("[Health] Create response:", response);
        toast.success("Policy created successfully!");
      }

      onPolicyUpdated();
    } catch (err) {
      console.error("\n[Health] Error submitting form:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      const errorMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save policy";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.log("=== [Health] Form Submit Ended ===\n");
    }
  };

  // --- CustomMenuList for react-select ---
  const CustomMenuList = (props) => (
    <>
      <components.MenuList {...props}>
        {props.children}
        <div style={{ padding: 8, borderTop: "1px solid #eee" }}>
          <button
            style={{
              width: "100%",
              background: "#1F4F9C",
              color: "#fff",
              border: "none",
              padding: 8,
              borderRadius: 4,
              cursor: "pointer",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setShowCreateICModal(true);
            }}
          >
            + Create Insurance Company
          </button>
        </div>
      </components.MenuList>
    </>
  );

  // --- insuranceCompanyOptions ---
  const insuranceCompanyOptions = insuranceCompanies.map((ic) => ({
    value: ic.id,
    label: ic.name,
  }));

  return (
    <>
      <form onSubmit={handleSubmit} className="insurance-form">
        <div className="insurance-form-grid">
          <div className="insurance-form-group">
            <Select
              options={combinedOptions}
              value={combinedOptions
                .flatMap((group) => group.options)
                .find(
                  (option) =>
                    (option.type === "company" &&
                      option.data.company_id === formData.companyId) ||
                    (option.type === "consumer" &&
                      option.data.consumer_id === formData.consumerId)
                )}
              onChange={handleHolderChange}
              placeholder="Select Company or Consumer"
              isClearable
              isSearchable={true}
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
                control: (provided) => ({
                  ...provided,
                  minHeight: "44px",
                  borderRadius: "8px",
                  borderColor: "#d1d5db",
                }),
                groupHeading: (provided) => ({
                  ...provided,
                  fontWeight: "bold",
                  color: "#1F4F9C",
                  backgroundColor: "#f3f4f6",
                  padding: "8px 12px",
                  margin: 0,
                }),
              }}
            />
          </div>
          <div className="insurance-form-group">
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="insurance-form-input"
            >
              <option value="">Select Business Type</option>
              <option value="Fresh/New">Fresh/New</option>
              <option value="Renewal/Rollover">Renewal/Rollover</option>
              <option value="Endorsement">Endorsement</option>
            </select>
          </div>
          <div className="insurance-form-group">
            <select
              name="customerType"
              value={formData.customerType}
              onChange={handleChange}
              className="insurance-form-input"
            >
              <option value="">Select Customer Type</option>
              <option value="Organisation">Organisation</option>
              <option value="Individual">Individual</option>
            </select>
          </div>
          <div className="insurance-form-group">
            <input
              type="text"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleChange}
              placeholder="Policy Number"
              className="insurance-form-input"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="insurance-form-input"
              readOnly={!!formData.companyId}
            />
          </div>
          <div className="insurance-form-group">
            <PhoneInput
              international
              defaultCountry="IN"
              value={formData.mobileNumber}
              onChange={handlePhoneChange}
              placeholder="Mobile Number"
              className="insurance-form-input phone-input-custom"
              flags={flags}
              readOnly={!!formData.companyId}
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="text"
              name="proposer_name"
              value={formData.proposer_name}
              readOnly
              className="insurance-form-input"
              placeholder="Proposer Name"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="date"
              name="policyStartDate"
              value={formData.policyStartDate}
              onChange={handleChange}
              className="insurance-form-input"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="date"
              name="policyEndDate"
              value={formData.policyEndDate}
              onChange={handleChange}
              className="insurance-form-input"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="text"
              name="planName"
              value={formData.planName}
              onChange={handleChange}
              placeholder="Plan Name"
              className="insurance-form-input"
            />
          </div>
          <div className="insurance-form-group">
            <select
              name="medicalCover"
              value={formData.medicalCover}
              onChange={handleChange}
              className="insurance-form-input"
            >
              <option value="">Select Medical Cover (in lac)</option>
              <option value="5">5</option>
              <option value="7">7</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="25">25</option>
            </select>
          </div>
          <div className="insurance-form-group">
            <input
              type="number"
              name="netPremium"
              value={formData.netPremium}
              onChange={handleChange}
              placeholder="Net Premium"
              className="insurance-form-input"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="number"
              name="gst"
              value={gst}
              placeholder="GST (18%)"
              className="insurance-form-input"
              readOnly
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="number"
              name="grossPremium"
              value={grossPremium}
              placeholder="Gross Premium"
              className="insurance-form-input"
              readOnly
            />
          </div>
          <div className="insurance-form-group">
            <Select
              options={insuranceCompanyOptions}
              value={
                insuranceCompanyOptions.find(
                  (opt) => opt.value === formData.insuranceCompanyId
                ) || null
              }
              onChange={(option) =>
                setFormData((prev) => ({
                  ...prev,
                  insuranceCompanyId: option ? option.value : "",
                }))
              }
              placeholder="Select Insurance Company"
              isClearable
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
                control: (provided) => ({
                  ...provided,
                  minHeight: "44px",
                  borderRadius: "8px",
                  borderColor: "#d1d5db",
                }),
              }}
              components={{ MenuList: CustomMenuList }}
            />
          </div>
          <div className="insurance-form-group file-upload-group">
            <label className="file-upload-label">
              <span>Policy Document</span>
              <div className="file-upload-container">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "policyDocument")}
                  accept=".pdf,.doc,.docx"
                  className="file-upload-input"
                />
                <div className="file-upload-button">
                  <BiUpload />{" "}
                  {fileNames.policyDocument || "Upload Policy Document"}
                </div>
              </div>
            </label>
          </div>
          <div
            className="insurance-form-group"
            style={{ gridColumn: "span 2" }}
          >
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Remarks"
              className="insurance-form-input"
              rows={2}
            />
          </div>
        </div>
        <div className="insurance-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {policy ? "Update" : "Create"}
          </Button>
        </div>
      </form>
      <CreateInsuranceCompanyModal
        isOpen={showCreateICModal}
        onClose={() => setShowCreateICModal(false)}
        onCreated={(company) => {
          setNewICId(company.id);
          setShowCreateICModal(false);
        }}
      />
    </>
  );
};

// --- StatisticsCards Component ---
const StatisticsCards = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="statistics-section">
        <div className="statistics-grid">
          {[1, 2, 3].map((i) => (
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

  const { totalPolicies, activePolicies, recentPolicies } = statistics;
  const activePercentage = totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0;
  const recentPercentage = totalPolicies > 0 ? Math.round((recentPolicies / totalPolicies) * 100) : 0;

  return (
    <div className="statistics-section">
      <div className="statistics-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <BiShield />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalPolicies}</div>
            <div className="stat-label">Total Policies</div>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <BiTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-number">{activePolicies}</div>
            <div className="stat-label">Active Policies</div>
            <div className="stat-percentage">{activePercentage}%</div>
          </div>
        </div>
        <div className="stat-card recent">
          <div className="stat-icon">
            <BiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-number">{recentPolicies}</div>
            <div className="stat-label">Recent Policies</div>
            <div className="stat-percentage">{recentPercentage}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Health({ searchQuery = "" }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    recentPolicies: 0,
    monthlyStats: []
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const { user, userRoles } = useAuth();
  const isCompany = userRoles.includes("company");
  const isConsumer = userRoles.includes("consumer");
  const companyId = user?.profile?.company_id || user?.company?.company_id;
  const consumerId = user?.profile?.consumer_id || user?.consumer?.consumer_id;
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    fetchPolicies(1, 10);
    fetchHealthStatistics();
  }, []);

  // Handle search when searchQuery changes
  useEffect(() => {
    console.log('Health: searchQuery changed:', searchQuery);
    if (searchQuery && searchQuery.length >= 3) {
      console.log('Health: Triggering server search for:', searchQuery);
      handleSearchPolicies(searchQuery);
    } else if (searchQuery === "") {
      console.log('Health: Clearing search, fetching all policies');
      fetchPolicies(1, pagination.pageSize);
    }
  }, [searchQuery]);

  const fetchPolicies = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      console.log('Health: Fetching policies for page:', page, 'pageSize:', pageSize);
      const response = await healthPolicyAPI.getAllPolicies({
        page,
        pageSize,
      });
      console.log('Health: Fetch response:', response);

      if (response && response.policies && Array.isArray(response.policies)) {
        setPolicies(response.policies);
        setPagination({
          currentPage: response.currentPage || page,
          pageSize: response.pageSize || pageSize,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || 0,
        });
        setError(null);
      } else if (Array.isArray(response)) {
        setPolicies(response);
        setPagination((prev) => ({ ...prev, currentPage: page }));
        setError(null);
      } else {
        setError("Invalid data format received from server");
        setPolicies([]);
      }
    } catch (err) {
      console.error('Health: Error fetching policies:', err);
      setError("");
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await healthPolicyAPI.getHealthStatistics();
      setStatistics(response);
    } catch (err) {
      console.error('[Health] Error fetching health policy statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSearchPolicies = async (query) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Health: Searching policies with query:', query);
      const response = await healthPolicyAPI.searchPolicies({ q: query });
      console.log('Health: Search response:', response);
      
      // Handle both expected format and direct array response
      if (response && response.success && Array.isArray(response.policies)) {
        setPolicies(response.policies);
        setError(null);
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        setPolicies(response);
        setError(null);
      } else {
        console.error("Invalid search response format:", response);
        // Fallback to client-side search if server search fails
        console.log('Health: Server search failed, falling back to client-side search');
      }
    } catch (err) {
      console.error("Error searching health policies:", err);
      // Fallback to client-side search if server search fails
      console.log('Health: Server search error, falling back to client-side search');
    } finally {
      setLoading(false);
    }
  };

  // Filter policies based on search query (client-side fallback)
  const filteredPolicies = React.useMemo(() => {
    if (isCompany) {
      return policies.filter((p) => p.company_id === companyId);
    }
    if (isConsumer) {
      return policies.filter((p) => p.consumer_id === consumerId);
    }
    return policies;
  }, [policies, isCompany, isConsumer, companyId, consumerId]);

  const searchFilteredPolicies = React.useMemo(() => {
    if (!searchQuery || searchQuery.length < 3) {
      return filteredPolicies;
    }
    return filteredPolicies.filter((policy) => {
      const searchLower = searchQuery.toLowerCase();
      
      // Search in policy fields
      const policyFields = [
        policy.policy_number,
        policy.business_type,
        policy.customer_type,
        policy.email,
        policy.mobile_number,
        policy.proposer_name,
        policy.plan_name,
        policy.medical_cover,
        policy.net_premium,
        policy.remarks
      ].some(field => field && field.toString().toLowerCase().includes(searchLower));

      // Search in company name
      const companyName = policy.companyPolicyHolder?.company_name ||
                         policy.company?.company_name ||
                         policy.company_name;
      const companyMatch = companyName && companyName.toLowerCase().includes(searchLower);

      // Search in consumer name
      const consumerName = policy.consumerPolicyHolder?.name ||
                          policy.consumer?.name ||
                          policy.consumer_name;
      const consumerMatch = consumerName && consumerName.toLowerCase().includes(searchLower);

      // Search in insurance company name
      const insuranceCompanyName = policy.provider?.name;
      const insuranceMatch = insuranceCompanyName && insuranceCompanyName.toLowerCase().includes(searchLower);

      const matches = policyFields || companyMatch || consumerMatch || insuranceMatch;
      
      if (matches) {
        console.log('Health: Policy matches search:', {
          id: policy.id,
          policy_number: policy.policy_number,
          companyName,
          consumerName,
          insuranceCompanyName
        });
      }
      
      return matches;
    });
  }, [filteredPolicies, searchQuery]);

  const handleDelete = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await healthPolicyAPI.deletePolicy(policyId);
        toast.success("Policy deleted successfully!");
        await fetchPolicies(pagination.currentPage, pagination.pageSize);
        await fetchHealthStatistics();
      } catch (err) {
        setError("Failed to delete policy");
        toast.error("Failed to delete policy");
      }
    }
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedPolicy(null);
    setShowModal(false);
  };

  const handlePolicyUpdated = async () => {
    await fetchPolicies(pagination.currentPage, pagination.pageSize);
    await fetchHealthStatistics();
    handleModalClose();
  };

  const handlePageChange = async (page) => {
    console.log("Health: Page changed to:", page);
    await fetchPolicies(page, pagination.pageSize);
  };

  const handlePageSizeChange = async (newPageSize) => {
    console.log("Health: Page size changed to:", newPageSize);
    
    // Update pagination state first
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      pageSize: newPageSize,
    }));
    
    // Then fetch policies with the new page size
    await fetchPolicies(1, newPageSize);
  };

  const handleDownloadDocuments = (policy) => {
    setSelectedPolicy(policy);
    setShowDocumentModal(true);
  };

  const columns = [
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index, pagination = {}) => {
        const { currentPage = 1, pageSize = 10 } = pagination;
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      key: "company_or_consumer",
      label: "Company Name / Consumer Name",
      sortable: false,
      render: (_, policy) => {
        return (
          policy.companyPolicyHolder?.company_name ||
          policy.consumerPolicyHolder?.name ||
          policy.company_name ||
          policy.consumer_name ||
          policy.company?.company_name ||
          policy.consumer?.name ||
          '-'
        );
      }
    },
    { key: "policy_number", label: "Policy Number", sortable: true },
    { key: "business_type", label: "Business Type", sortable: true },
    { key: "customer_type", label: "Customer Type", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "mobile_number", label: "Mobile Number", sortable: true },
    { key: "net_premium", label: "Net Premium", sortable: true },
    { key: "status", label: "Status", sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (_, policy) => (
        <div className="insurance-actions">
          <ActionButton
            onClick={() => handleEdit(policy)}
            variant="secondary"
            size="small"
          >
            <BiEdit />
          </ActionButton>
          <ActionButton
            onClick={() => handleDelete(policy.id)}
            variant="danger"
            size="small"
          >
            <BiTrash />
          </ActionButton>
          <DocumentDownload
            system="health-policies"
            recordId={policy.id}
            buttonText=""
            buttonClass="action-button action-button-secondary action-button-small"
            showIcon={true}
            filePath={policy.policy_document_path ? `/uploads/health_policies/${policy.policy_document_path}` : null}
            fileName={policy.policy_document_path || 'policy-document.pdf'}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="insurance">
      <div className="insurance-container">
        <div className="insurance-content">
          <div className="insurance-header">
            <h1 className="insurance-title">Health Insurance Policies</h1>
            <Button
              variant="contained"
              onClick={() => setShowModal(true)}
              icon={<BiPlus />}
            >
              Add Policy
            </Button>
          </div>
          
          <StatisticsCards statistics={statistics} loading={statsLoading} />
          
          {error && (
            <div className="insurance-error">
              <BiErrorCircle className="inline mr-2" /> {error}
            </div>
          )}
          {loading ? (
            <Loader size="large" color="primary" />
          ) : (
            <TableWithControl
              data={searchFilteredPolicies}
              columns={columns}
              defaultPageSize={pagination.pageSize}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              serverSidePagination={true}
            />
          )}
        </div>
        <Modal
          isOpen={showModal}
          onClose={handleModalClose}
          title={selectedPolicy ? "Edit Policy" : "Add New Policy"}
        >
          <PolicyForm
            policy={selectedPolicy}
            onClose={handleModalClose}
            onPolicyUpdated={handlePolicyUpdated}
          />
        </Modal>
      </div>
      {/* Document Download Modal */}
      {showDocumentModal && selectedPolicy && (
        <DocumentDownload
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          system="health"
          recordId={selectedPolicy.id}
          recordName={selectedPolicy.policyNumber || selectedPolicy.clientName}
        />
      )}
    </div>
  );
}

export default Health;
