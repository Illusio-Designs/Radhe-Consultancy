import React, { useState, useEffect } from "react";
import {
  BiPlus,
  BiEdit,
  BiTrash,
  BiErrorCircle,
  BiUpload,
} from "react-icons/bi";
import {
  vehiclePolicyAPI,
  insuranceCompanyAPI,
  employeeCompensationAPI,
} from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
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
    subProduct: "",
    vehicleNumber: "",
    segment: "",
    manufacturingCompany: "",
    model: "",
    manufacturingYear: "",
    idv: "",
    netPremium: "",
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
        subProduct: policy.sub_product || "",
        vehicleNumber: policy.vehicle_number || "",
        segment: policy.segment || "",
        manufacturingCompany: policy.manufacturing_company || "",
        model: policy.model || "",
        manufacturingYear: policy.manufacturing_year || "",
        idv: policy.idv || "",
        netPremium: policy.net_premium || "",
        remarks: policy.remarks || "",
        organisation_or_holder_name: policy.organisation_or_holder_name || "",
      });
      setFileNames({ policyDocument: policy.policy_document_path || "" });
    }
  }, [policy]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch companies
        const companiesResponse = await vehiclePolicyAPI.getActiveCompanies();
        setCompanies(companiesResponse);

        // Fetch consumers
        const consumersResponse = await vehiclePolicyAPI.getActiveConsumers();
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
      console.log(`[Vehicle] File selected for ${type}:`, {
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
    console.log("[Vehicle] Initial form state:", {
      formData,
      files,
      fileNames,
      policy,
    });

    // Validate required fields
    const requiredFields = [
      "businessType",
      "customerType",
      "insuranceCompanyId",
      "policyNumber",
      "email",
      "mobileNumber",
      "policyStartDate",
      "policyEndDate",
      "subProduct",
      "vehicleNumber",
      "segment",
      "manufacturingCompany",
      "model",
      "manufacturingYear",
      "idv",
      "netPremium",
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
      console.error("[Vehicle] Missing required fields:", missingFields);
      setLoading(false);
      return;
    }

    // Validate file upload for new policies
    if (!policy && !files.policyDocument) {
      setError("Policy document is required for new policies");
      console.error("[Vehicle] Policy document is missing for new policy");
      setLoading(false);
      return;
    }

    const submitData = new FormData();

    try {
      // Log form data before conversion
      console.log("[Vehicle] Form data before conversion:", formData);

      // Add all form fields with proper type conversion
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert camelCase to snake_case for API
          const apiKey = key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`
          );

          // Handle numeric fields
          if (["idv", "netPremium"].includes(key)) {
            submitData.append(apiKey, parseFloat(value).toFixed(2));
          }
          // Handle date fields
          else if (["policyStartDate", "policyEndDate"].includes(key)) {
            submitData.append(apiKey, new Date(value).toISOString());
          }
          // Handle all other fields
          else {
            submitData.append(apiKey, value);
          }
          console.log(`[Vehicle] Appending form field: ${apiKey} = ${value}`);
        }
      });

      // Add calculated fields with proper decimal formatting
      submitData.append("gst", gst.toFixed(2));
      submitData.append("gross_premium", grossPremium.toFixed(2));
      console.log("[Vehicle] Appended calculated fields:", {
        gst: gst.toFixed(2),
        gross_premium: grossPremium.toFixed(2),
      });

      // Handle file upload
      if (files.policyDocument) {
        console.log("[Vehicle] File details before upload:", {
          name: files.policyDocument.name,
          type: files.policyDocument.type,
          size: `${(files.policyDocument.size / 1024 / 1024).toFixed(2)}MB`,
          lastModified: new Date(
            files.policyDocument.lastModified
          ).toISOString(),
        });

        // Use the field name expected by the backend's multer configuration
        submitData.append(
          "policyDocument",
          files.policyDocument,
          files.policyDocument.name
        );
        console.log(
          "[Vehicle] File appended to FormData with field name 'policyDocument'"
        );
      } else {
        console.log("[Vehicle] No file to upload");
      }

      // Log the complete FormData contents
      console.log("[Vehicle] Complete FormData contents:");
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
        console.log("[Vehicle] Updating existing policy:", policy.id);
        resp = await vehiclePolicyAPI.updatePolicy(policy.id, submitData);
        console.log("[Vehicle] Update response:", resp);
        toast.success("Policy updated successfully!");
      } else {
        console.log("[Vehicle] Creating new policy");
        resp = await vehiclePolicyAPI.createPolicy(submitData);
        console.log("[Vehicle] Create response:", resp);
        toast.success("Policy created successfully!");
      }

      onPolicyUpdated();
    } catch (err) {
      console.error("[Vehicle] API error:", {
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
            <select
              name="subProduct"
              value={formData.subProduct}
              onChange={handleChange}
              className="insurance-form-input"
            >
              <option value="">Select Sub Product</option>
              <option value="Two Wheeler">Two Wheeler</option>
              <option value="Private car">Private car</option>
              <option value="Passanger Vehicle">Passanger Vehicle</option>
              <option value="Goods Vehicle">Goods Vehicle</option>
              <option value="Misc - D Vehicle">Misc - D Vehicle</option>
              <option value="Standalone CPA">Standalone CPA</option>
            </select>
          </div>
          <div className="insurance-form-group">
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              placeholder="Vehicle Number"
              className="insurance-form-input"
            />
          </div>
          <div className="insurance-form-group">
            <select
              name="segment"
              value={formData.segment}
              onChange={handleChange}
              className="insurance-form-input"
            >
              <option value="">Select Segment</option>
              <option value="Comprehensive">Comprehensive</option>
              <option value="TP Only">TP Only</option>
              <option value="SAOD">SAOD</option>
            </select>
          </div>
          <div className="insurance-form-group">
            <input
              type="text"
              name="manufacturingCompany"
              value={formData.manufacturingCompany}
              onChange={handleChange}
              placeholder="Manufacturing Company"
              className="insurance-form-input"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Model"
              className="insurance-form-input"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="text"
              name="manufacturingYear"
              value={formData.manufacturingYear}
              onChange={handleChange}
              placeholder="Manufacturing Year"
              className="insurance-form-input"
            />
          </div>
          <div className="insurance-form-group">
            <input
              type="number"
              name="idv"
              value={formData.idv}
              onChange={handleChange}
              placeholder="IDV"
              className="insurance-form-input"
            />
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

function Vehicle({ searchQuery = "" }) {
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
    console.log('Vehicle: searchQuery changed:', searchQuery);
    if (searchQuery && searchQuery.length >= 3) {
      console.log('Vehicle: Triggering server search for:', searchQuery);
      handleSearchPolicies(searchQuery);
    } else if (searchQuery === "") {
      console.log('Vehicle: Clearing search, fetching all policies');
      fetchPolicies();
    }
  }, [searchQuery]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      console.log('Vehicle: Fetching all policies');
      const response = await vehiclePolicyAPI.getAllPolicies();
      console.log('Vehicle: Fetch response:', response);
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
      console.error('Vehicle: Error fetching policies:', err);
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
      console.log('Vehicle: Searching policies with query:', query);
      const response = await vehiclePolicyAPI.searchPolicies({ q: query });
      console.log('Vehicle: Search response:', response);
      
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
        console.log('Vehicle: Server search failed, falling back to client-side search');
      }
    } catch (err) {
      console.error("Error searching vehicle policies:", err);
      // Fallback to client-side search if server search fails
      console.log('Vehicle: Server search error, falling back to client-side search');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Filter policies based on search query (client-side fallback)
  const filteredPolicies = React.useMemo(() => {
    console.log('Vehicle: Filtering policies with searchQuery:', searchQuery);
    console.log('Vehicle: Total policies to filter:', policies.length);
    
    if (!searchQuery || searchQuery.length < 3) {
      console.log('Vehicle: No search query or too short, returning all policies');
      return policies;
    }

    const filtered = policies.filter((policy) => {
      const searchLower = searchQuery.toLowerCase();
      
      // Search in policy fields
      const policyFields = [
        policy.policy_number,
        policy.business_type,
        policy.customer_type,
        policy.email,
        policy.mobile_number,
        policy.organisation_or_holder_name,
        policy.vehicle_number,
        policy.manufacturing_company,
        policy.model,
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
        console.log('Vehicle: Policy matches search:', {
          id: policy.id,
          policy_number: policy.policy_number,
          companyName,
          consumerName,
          insuranceCompanyName
        });
      }
      
      return matches;
    });
    
    console.log('Vehicle: Filtered policies count:', filtered.length);
    return filtered;
  }, [policies, searchQuery]);

  const handleDelete = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await vehiclePolicyAPI.deletePolicy(policyId);
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
        </div>
      ),
    },
  ];

  return (
    <div className="insurance">
      <div className="insurance-container">
        <div className="insurance-content">
          <div className="insurance-header">
            <h1 className="insurance-title">Vehicle Insurance Policies</h1>
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

export default Vehicle;
