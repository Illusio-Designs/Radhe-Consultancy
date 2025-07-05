import React, { useState, useEffect } from "react";
import {
  BiPlus,
  BiEdit,
  BiTrash,
  BiErrorCircle,
  BiUpload,
} from "react-icons/bi";
import {
  lifePolicyAPI,
  insuranceCompanyAPI,
} from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Pagination from "../../../components/common/Pagination/Pagination";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/insurance/Insurance.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";
import Select, { components } from "react-select";

// Add CreateInsuranceCompanyModal component
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
    insuranceCompanyId: "",
    companyId: "",
    consumerId: "",
    currentPolicyNumber: "",
    email: "",
    mobileNumber: "",
    policyStartDate: "",
    issueDate: "",
    dateOfBirth: "",
    planName: "",
    subProduct: "",
    pt: "",
    ppt: "",
    remarks: "",
    organisation_or_holder_name: "",
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
      let holderName = "";
      let email = "";
      let mobile = "";
      // Check for consumer or company
      if (policy.consumerPolicyHolder) {
        holderName = policy.consumerPolicyHolder.name || "";
        email = policy.consumerPolicyHolder.email || "";
        mobile = policy.consumerPolicyHolder.phone_number || "";
      } else if (policy.companyPolicyHolder) {
        holderName = policy.companyPolicyHolder.company_name || "";
        email = policy.companyPolicyHolder.company_email || "";
        mobile = policy.companyPolicyHolder.contact_number || "";
      }
      setFormData({
        insuranceCompanyId: policy.insurance_company_id || "",
        companyId: policy.company_id || "",
        consumerId: policy.consumer_id || "",
        currentPolicyNumber: policy.current_policy_number || "",
        email: email,
        mobileNumber: mobile,
        policyStartDate: policy.policy_start_date
          ? policy.policy_start_date.slice(0, 10)
          : "",
        issueDate: policy.issue_date
          ? policy.issue_date.slice(0, 10)
          : "",
        dateOfBirth: policy.date_of_birth
          ? policy.date_of_birth.slice(0, 10)
          : "",
        planName: policy.plan_name || "",
        subProduct: policy.sub_product || "",
        pt: policy.pt || "",
        ppt: policy.ppt || "",
        remarks: policy.remarks || "",
        organisation_or_holder_name: holderName,
      });
      setFileNames({ policyDocument: policy.policy_document_path || "" });
    }
  }, [policy]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch companies
        const companiesResponse = await lifePolicyAPI.getActiveCompanies();
        setCompanies(companiesResponse);

        // Fetch consumers
        const consumersResponse = await lifePolicyAPI.getActiveConsumers();
        setConsumers(consumersResponse);

        // Create combined options
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
        console.error("Error fetching data:", err);
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
    // Calculate GST and Gross Premium whenever netPremium changes
    const net = parseFloat(formData.netPremium) || 0;
    const gstVal = +(net * 0.18).toFixed(2);
    setGst(gstVal);
    setGrossPremium(+(net + gstVal).toFixed(2));
  }, [formData.netPremium]);

  const handleHolderChange = (option) => {
    if (!option) {
      setFormData((prev) => ({
        ...prev,
        companyId: "",
        consumerId: "",
        email: "",
        mobileNumber: "",
        organisation_or_holder_name: "",
      }));
      return;
    }

    const { type, data } = option;
    if (type === "company") {
      setFormData((prev) => ({
        ...prev,
        companyId: data.company_id,
        consumerId: "",
        email: data.company_email,
        mobileNumber: data.contact_number,
        organisation_or_holder_name: data.company_name,
      }));
    } else if (type === "consumer") {
      setFormData((prev) => ({
        ...prev,
        companyId: "",
        consumerId: data.consumer_id,
        email: data.email,
        mobileNumber: data.phone_number,
        organisation_or_holder_name: data.name,
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`[Life] File selected for ${type}:`, {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      });

      // Validate file type
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

      // Validate file size (5MB limit)
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
    setLoading(true);
    setError("");

    // Log initial state
    console.log("[Life] Initial form state:", {
      formData,
      files,
      fileNames,
      policy,
    });

    // Validate required fields
    const requiredFields = [
      "insuranceCompanyId",
      "currentPolicyNumber",
      "email",
      "mobileNumber",
      "policyStartDate",
      "issueDate",
      "dateOfBirth",
      "planName",
      "subProduct",
      "pt",
      "ppt",
      "remarks",
      "organisation_or_holder_name",
    ];
    const missingFields = requiredFields.filter((field) => {
      const value = formData[field];
      return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (typeof value === "number" && isNaN(value))
      );
    });
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      console.error("[Life] Missing required fields:", missingFields);
      setLoading(false);
      return;
    }

    // Validate file upload for new policies
    if (!policy && !files.policyDocument) {
      setError("Policy document is required for new policies");
      console.error("[Life] Policy document is missing for new policy");
      setLoading(false);
      return;
    }

    const submitData = new FormData();

    try {
      // Log form data before conversion
      console.log("[Life] Form data before conversion:", formData);

      // Add all form fields with proper type conversion
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert camelCase to snake_case for API
          const apiKey = key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`
          );

          // Handle numeric fields
          if (["sumAssured", "netPremium"].includes(key)) {
            submitData.append(apiKey, parseFloat(value).toFixed(2));
          }
          // Handle date fields
          else if (["policyStartDate", "issueDate", "dateOfBirth"].includes(key)) {
            // Ensure dates are in YYYY-MM-DD format
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              submitData.append(apiKey, date.toISOString().split('T')[0]);
            }
          }
          // Handle all other fields
          else {
            submitData.append(apiKey, value);
          }
          console.log(`[Life] Appending form field: ${apiKey} = ${value}`);
        }
      });

      // Add calculated fields with proper decimal formatting
      submitData.append("gst", gst.toFixed(2));
      submitData.append("gross_premium", grossPremium.toFixed(2));
      console.log("[Life] Appended calculated fields:", {
        gst: gst.toFixed(2),
        gross_premium: grossPremium.toFixed(2),
      });

      // Handle file upload
      if (files.policyDocument) {
        console.log("[Life] File details before upload:", {
          name: files.policyDocument.name,
          type: files.policyDocument.type,
          size: `${(files.policyDocument.size / 1024 / 1024).toFixed(2)}MB`,
          lastModified: new Date(
            files.policyDocument.lastModified
          ).toISOString(),
        });

        // Use the field name expected by the backend's multer configuration
        submitData.append(
          "policy_document",
          files.policyDocument,
          files.policyDocument.name
        );
        console.log(
          "[Life] File appended to FormData with field name 'policy_document'"
        );
      } else {
        console.log("[Life] No file to upload");
      }

      // Log the complete FormData contents
      console.log("[Life] Complete FormData contents:");
      for (let [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, {
            name: value.name,
            type: value.type,
            size: `${(value.size / 1024 / 1024).toFixed(2)}MB`,
            lastModified: new Date(value.lastModified).toISOString(),
          });
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      let resp;
      if (policy) {
        console.log("[Life] Updating existing policy:", policy.id);
        resp = await lifePolicyAPI.updatePolicy(policy.id, submitData);
        console.log("[Life] Update response:", resp);
        toast.success("Policy updated successfully!");
      } else {
        console.log("[Life] Creating new policy");
        resp = await lifePolicyAPI.createPolicy(submitData);
        console.log("[Life] Create response:", resp);
        toast.success("Policy created successfully!");
      }

      onPolicyUpdated();
    } catch (err) {
      console.error("[Life] API error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        config: err.response?.config,
        validationErrors: err.response?.data?.errors,
        requestData: {
          formData,
          files,
          submitData: Object.fromEntries(submitData.entries()),
        },
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
    }
  };

  // Prepare options for react-select
  const insuranceCompanyOptions = insuranceCompanies.map((ic) => ({
    value: ic.id,
    label: ic.name,
  }));

  // Custom MenuList to add the "Create Insurance Company" button
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

  return (
    <>
      {error && <div className="insurance-error">{error}</div>}
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
            <input
              type="text"
              name="organisation_or_holder_name"
              value={formData.organisation_or_holder_name}
              readOnly
              className="insurance-form-input"
              placeholder="Organisation Name / Policy Holder Name"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="text"
              name="currentPolicyNumber"
              value={formData.currentPolicyNumber}
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
              type="date"
              name="policyStartDate"
              value={formData.policyStartDate}
              onChange={handleChange}
              className="insurance-form-input"
              placeholder="Policy Start Date"
              title="Policy Start Date"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className="insurance-form-input"
              placeholder="Issue Date"
              title="Issue Date"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="insurance-form-input"
              placeholder="Date of Birth"
              title="Date of Birth"
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
            <input
              type="text"
              name="subProduct"
              value={formData.subProduct}
              onChange={handleChange}
              placeholder="Sub Product"
              className="insurance-form-input"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="number"
              name="pt"
              value={formData.pt}
              onChange={handleChange}
              placeholder="Premium Term"
              className="insurance-form-input"
              min="1"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="number"
              name="ppt"
              value={formData.ppt}
              onChange={handleChange}
              placeholder="Premium Payment Term"
              className="insurance-form-input"
              min="1"
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
              components={{ MenuList: CustomMenuList }}
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
                control: (provided) => ({
                  ...provided,
                  minHeight: "44px",
                  borderRadius: "8px",
                  borderColor: "#d1d5db",
                }),
              }}
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
        onCreated={(created) => {
          setShowCreateICModal(false);
          if (created && created.id) setNewICId(created.id);
        }}
      />
    </>
  );
};

function Life({ searchQuery = "" }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Handle search when searchQuery changes
  useEffect(() => {
    console.log('Life: searchQuery changed:', searchQuery);
    if (searchQuery && searchQuery.length >= 3) {
      console.log('Life: Triggering server search for:', searchQuery);
      handleSearchPolicies(searchQuery);
    } else if (searchQuery === "") {
      console.log('Life: Clearing search, fetching all policies');
      fetchPolicies();
    }
  }, [searchQuery]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      console.log('Life: Fetching all policies');
      const response = await lifePolicyAPI.getAllPolicies();
      console.log('Life: Fetch response:', response);
      if (response && Array.isArray(response.policies)) {
        setPolicies(response.policies);
        setError(null);
      } else if (Array.isArray(response)) {
        setPolicies(response);
        setError(null);
      } else {
        setError("Invalid data format received from server");
        setPolicies([]);
      }
    } catch (err) {
      console.error('Life: Error fetching policies:', err);
      setError("");
      setPolicies([]);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleSearchPolicies = async (query) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Life: Searching policies with query:', query);
      const response = await lifePolicyAPI.searchPolicies({ q: query });
      console.log('Life: Search response:', response);
      
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
        console.log('Life: Server search failed, falling back to client-side search');
      }
    } catch (err) {
      console.error("Error searching life policies:", err);
      // Fallback to client-side search if server search fails
      console.log('Life: Server search error, falling back to client-side search');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Filter policies based on search query (client-side fallback)
  const filteredPolicies = React.useMemo(() => {
    console.log('Life: Filtering policies with searchQuery:', searchQuery);
    console.log('Life: Total policies to filter:', policies.length);
    
    if (!searchQuery || searchQuery.length < 3) {
      console.log('Life: No search query or too short, returning all policies');
      return policies;
    }

    const filtered = policies.filter((policy) => {
      const searchLower = searchQuery.toLowerCase();
      
      // Search in policy fields
      const policyFields = [
        policy.current_policy_number,
        policy.business_type,
        policy.customer_type,
        policy.email,
        policy.mobile_number,
        policy.organisation_or_holder_name,
        policy.plan_name,
        policy.sum_assured,
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
        console.log('Life: Policy matches search:', {
          id: policy.id,
          policy_number: policy.current_policy_number,
          companyName,
          consumerName,
          insuranceCompanyName
        });
      }
      
      return matches;
    });
    
    console.log('Life: Filtered policies count:', filtered.length);
    return filtered;
  }, [policies, searchQuery]);

  const handleDelete = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await lifePolicyAPI.deletePolicy(policyId);
        toast.success("Policy deleted successfully!");
        await fetchPolicies();
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
    await fetchPolicies();
    handleModalClose();
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
        if (policy.companyPolicyHolder && policy.companyPolicyHolder.company_name) return policy.companyPolicyHolder.company_name;
        if (policy.consumerPolicyHolder && policy.consumerPolicyHolder.name) return policy.consumerPolicyHolder.name;
        if (policy.company_name) return policy.company_name;
        if (policy.consumer_name) return policy.consumer_name;
        if (policy.company && policy.company.company_name) return policy.company.company_name;
        if (policy.consumer && policy.consumer.name) return policy.consumer.name;
        return '-';
      }
    },
    { key: "current_policy_number", label: "Policy Number", sortable: true },
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
        </div>
      ),
    },
  ];

  return (
    <div className="insurance">
      <div className="insurance-container">
        <div className="insurance-content">
          <div className="insurance-header">
            <h1 className="insurance-title">Life Insurance Policies</h1>
            <Button
              variant="contained"
              onClick={() => setShowModal(true)}
              icon={<BiPlus />}
            >
              Add Policy
            </Button>
          </div>
          {error && (
            <div className="insurance-error">
              <BiErrorCircle className="inline mr-2" /> {error}
            </div>
          )}
          {loading ? (
            <Loader size="large" color="primary" />
          ) : (
            <TableWithControl
              data={filteredPolicies}
              columns={columns}
              defaultPageSize={10}
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
    </div>
  );
}

export default Life; 