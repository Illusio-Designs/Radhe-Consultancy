import React, { useState, useEffect, useRef } from "react";
import {
  BiPlus,
  BiEdit,
  BiTrash,
  BiErrorCircle,
  BiUpload,
  BiShield,
  BiTrendingUp,
  BiCalendar,
} from "react-icons/bi";
import {
  employeeCompensationAPI,
  insuranceCompanyAPI,
} from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/insurance/ECP.css";
import "../../../styles/components/StatCards.css";
import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select, { components } from "react-select";
import { useAuth } from "../../../contexts/AuthContext";

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
      const msg = err?.response?.data?.message || "Failed to create insurance company";
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
    policyNumber: "",
    email: "",
    mobileNumber: "",
    policyStartDate: "",
    policyEndDate: "",
    medicalCover: "",
    netPremium: "",
    gstNumber: "",
    panNumber: "",
    remarks: "",
  });

  const [files, setFiles] = useState({
    policyDocument: null,
  });

  const [fileNames, setFileNames] = useState({
    policyDocument: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [showCreateICModal, setShowCreateICModal] = useState(false);
  const [gst, setGst] = useState(0);
  const [grossPremium, setGrossPremium] = useState(0);
  const [newICId, setNewICId] = useState(null);

  useEffect(() => {
    if (policy) {
      console.log('PolicyForm: Received policy data:', policy);
      const formatDate = (dateStr) => (dateStr ? dateStr.slice(0, 10) : "");
      
      const formDataToSet = {
        businessType: policy.businessType || policy.business_type || "",
        customerType: policy.customerType || policy.customer_type || "",
        insuranceCompanyId: policy.insuranceCompanyId || policy.insurance_company_id || "",
        companyId: policy.companyId || policy.company_id || "",
        policyNumber: policy.policyNumber || policy.policy_number || "",
        email: policy.email || "",
        mobileNumber: policy.mobileNumber || policy.mobile_number || "",
        policyStartDate: formatDate(policy.policyStartDate || policy.policy_start_date),
        policyEndDate: formatDate(policy.policyEndDate || policy.policy_end_date),
        medicalCover: policy.medicalCover || policy.medical_cover || "",
        netPremium: policy.netPremium || policy.net_premium || "",
        gstNumber: policy.gstNumber || policy.gst_number || "",
        panNumber: policy.panNumber || policy.pan_number || "",
        remarks: policy.remarks || "",
      };
      
      console.log('PolicyForm: Setting form data:', formDataToSet);
      setFormData(formDataToSet);

      setFileNames({
        policyDocument: policy.policyDocumentName || policy.policy_document_name || "",
      });
    }
  }, [policy]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await employeeCompensationAPI.getActiveCompanies();
        if (Array.isArray(response)) {
          setCompanies(response);
        } else {
          console.error("Invalid response format:", response);
          toast.error("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        toast.error(err.response?.data?.message || "Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchICs = async () => {
      try {
        const data = await insuranceCompanyAPI.getAllCompanies();
        // Support both array and {success, data: array}
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
    // eslint-disable-next-line
  }, [showCreateICModal]);

  useEffect(() => {
    // Calculate GST and Gross Premium whenever netPremium changes
    const net = parseFloat(formData.netPremium) || 0;
    const gstVal = +(net * 0.18).toFixed(2);
    setGst(gstVal);
    setGrossPremium(+(net + gstVal).toFixed(2));
  }, [formData.netPremium]);

  const handleCompanyChange = (e) => {
    const selectedCompanyId = e.target.value;
    const selectedCompany = companies.find(
      (company) => company.company_id === parseInt(selectedCompanyId)
    );
    if (selectedCompany) {
      console.log(
        "GST Number:",
        selectedCompany.gst_number,
        "PAN Number:",
        selectedCompany.pan_number
      );
    }
    setFormData((prev) => ({
      ...prev,
      companyId: selectedCompanyId,
      email: selectedCompany ? selectedCompany.company_email : "",
      mobileNumber: selectedCompany ? selectedCompany.contact_number : "",
      gstNumber: selectedCompany ? selectedCompany.gst_number : "",
      panNumber: selectedCompany ? selectedCompany.pan_number : "",
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [type]: file,
      }));
      setFileNames((prev) => ({
        ...prev,
        [type]: file.name,
      }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      mobileNumber: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");
    setLoading(true);
    setError("");

    // Validate required fields
    const requiredFields = [
      "businessType",
      "customerType",
      "insuranceCompanyId",
      "companyId",
      "policyNumber",
      "email",
      "mobileNumber",
      "policyStartDate",
      "policyEndDate",
      "medicalCover",
      "netPremium",
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
      const errorMessage = `Missing required fields: ${missingFields.join(
        ", "
      )}`;
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    // Validate file upload for new policies
    if (!policy && !files.policyDocument) {
      const errorMessage = "Policy document is required";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    try {
      console.log("Preparing form data:", formData);
      // Ensure only snake_case fields are sent to backend
      const submitData = new FormData();
      submitData.append("business_type", formData.businessType);
      submitData.append("customer_type", formData.customerType);
      submitData.append("insurance_company_id", formData.insuranceCompanyId);
      submitData.append("company_id", formData.companyId);
      submitData.append("policy_number", formData.policyNumber);
      submitData.append("email", formData.email);
      submitData.append("mobile_number", formData.mobileNumber);
      submitData.append("policy_start_date", formData.policyStartDate);
      submitData.append("policy_end_date", formData.policyEndDate);
      submitData.append("medical_cover", formData.medicalCover);
      submitData.append("net_premium", formData.netPremium);
      submitData.append("gst_number", formData.gstNumber);
      submitData.append("pan_number", formData.panNumber);
      submitData.append("remarks", formData.remarks);
      submitData.append("gst", gst);
      submitData.append("gross_premium", grossPremium);

      // Handle file upload
      if (files.policyDocument) {
        console.log("File details:", {
          name: files.policyDocument.name,
          type: files.policyDocument.type,
          size: files.policyDocument.size,
          lastModified: new Date(
            files.policyDocument.lastModified
          ).toISOString(),
        });

        // Append file with the exact field name expected by multer
        submitData.append("policyDocument", files.policyDocument);

        // Verify file was appended correctly
        const file = submitData.get("policyDocument");
        console.log("File appended to FormData:", {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: new Date(file.lastModified).toISOString(),
        });
      }

      // Log the complete FormData contents
      console.log("FormData contents:");
      for (let pair of submitData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], {
            name: pair[1].name,
            type: pair[1].type,
            size: pair[1].size,
            lastModified: new Date(pair[1].lastModified).toISOString(),
          });
        } else {
          console.log(pair[0], pair[1]);
        }
      }

      let response;
      if (policy) {
        console.log("Updating existing policy:", policy.id);
        response = await employeeCompensationAPI.updatePolicy(
          policy.id,
          submitData
        );
        console.log("Update response:", response);
        toast.success("Policy updated successfully!");
      } else {
        console.log("Creating new policy");
        response = await employeeCompensationAPI.createPolicy(submitData);
        console.log("Create response:", response);
        toast.success("Policy created successfully!");
      }

      onPolicyUpdated();
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error saving company';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      {/* Remove inline error display */}

      <form onSubmit={handleSubmit} className="insurance-form">
        <div className="insurance-form-grid">
          <div className="insurance-form-group">
            <Select
              options={companies.map((company) => ({
                value: company.company_id,
                label: company.company_name,
                data: company,
              }))}
              value={
                companies
                  .map((company) => ({
                    value: company.company_id,
                    label: company.company_name,
                    data: company,
                  }))
                  .find((opt) => opt.value === formData.companyId) || null
              }
              onChange={(option) => {
                const selectedCompany = option ? option.data : null;
                setFormData((prev) => ({
                  ...prev,
                  companyId: option ? option.value : "",
                  email: selectedCompany ? selectedCompany.company_email : "",
                  mobileNumber: selectedCompany
                    ? selectedCompany.contact_number
                    : "",
                  gstNumber: selectedCompany ? selectedCompany.gst_number : "",
                  panNumber: selectedCompany ? selectedCompany.pan_number : "",
                }));
              }}
              placeholder="Select Company"
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
              }}
            />
          </div>

          <div className="insurance-form-group">
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required
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
              required
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
              required
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
              required
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
              required
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
              required
              className="insurance-form-input"
            />
          </div>

          <div className="insurance-form-group">
            <input
              type="date"
              name="policyEndDate"
              value={formData.policyEndDate}
              onChange={handleChange}
              required
              className="insurance-form-input"
            />
          </div>

          <div className="insurance-form-group">
            <select
              name="medicalCover"
              value={formData.medicalCover}
              onChange={handleChange}
              required
              className="insurance-form-input"
            >
              <option value="">Select Medical Cover</option>
              <option value="25k">25k</option>
              <option value="50k">50k</option>
              <option value="1 lac">1 lac</option>
              <option value="2 lac">2 lac</option>
              <option value="3 lac">3 lac</option>
              <option value="5 lac">5 lac</option>
              <option value="actual">Actual</option>
            </select>
          </div>

          <div className="insurance-form-group">
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="GST Number"
              className="insurance-form-input"
              readOnly={!!formData.companyId}
            />
          </div>

          <div className="insurance-form-group">
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              placeholder="PAN Number"
              className="insurance-form-input"
              readOnly={!!formData.companyId}
            />
          </div>

          <div className="insurance-form-group">
            <input
              type="number"
              name="netPremium"
              value={formData.netPremium}
              onChange={handleChange}
              placeholder="Net Premium"
              required
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
                  accept=".pdf,.jpg,.jpeg,.png"
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

function ECP({ searchQuery = "" }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
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

  useEffect(() => {
    fetchPolicies(1, 10);
    fetchECPStatistics();
  }, []);

  // Handle search when searchQuery changes
  useEffect(() => {
    console.log("ECP: searchQuery changed:", searchQuery);
    if (searchQuery && searchQuery.length >= 3) {
      console.log("ECP: Triggering server search for:", searchQuery);
      handleSearchPolicies(searchQuery);
    } else if (searchQuery === "") {
      console.log("ECP: Clearing search, fetching all policies");
      fetchPolicies(1, pagination.pageSize);
    }
  }, [searchQuery, pagination.pageSize]);

  const fetchECPStatistics = async () => {
    try {
      console.log('[ECP] fetchECPStatistics called');
      setStatsLoading(true);
      
      console.log('[ECP] Calling getECPStatistics API...');
      const response = await employeeCompensationAPI.getECPStatistics();
      console.log('[ECP] API response received:', response);
      
      if (response.success) {
        console.log('[ECP] Setting statistics:', response.data);
        setStatistics(response.data);
      } else {
        console.log('[ECP] API returned success: false');
      }
    } catch (error) {
      console.error('[ECP] Error fetching ECP statistics:', error);
      console.error('[ECP] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchPolicies = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      console.log(
        "ECP: Fetching policies for page:",
        page,
        "pageSize:",
        pageSize
      );
      const response = await employeeCompensationAPI.getAllPolicies({
        page,
        pageSize,
      });
      console.log("ECP: Fetch response:", response);

      if (response && response.policies && Array.isArray(response.policies)) {
        // Transform the policies to ensure consistent data structure
        const transformedPolicies = response.policies.map(policy => ({
          ...policy,
          // Ensure policyHolder is available for company name display
          policyHolder: policy.policyHolder || policy.companyPolicyHolder,
          // Keep original properties for backward compatibility
          companyPolicyHolder: policy.policyHolder || policy.companyPolicyHolder,
          consumerPolicyHolder: policy.consumerPolicyHolder,
        }));
        setPolicies(transformedPolicies);
        setPagination({
          currentPage: response.currentPage || page,
          pageSize: response.pageSize || pageSize,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || 0,
        });
        setError(null);
      } else if (Array.isArray(response)) {
        // Transform the policies to ensure consistent data structure
        const transformedPolicies = response.map(policy => ({
          ...policy,
          // Ensure policyHolder is available for company name display
          policyHolder: policy.policyHolder || policy.companyPolicyHolder,
          // Keep original properties for backward compatibility
          companyPolicyHolder: policy.policyHolder || policy.companyPolicyHolder,
          consumerPolicyHolder: policy.consumerPolicyHolder,
        }));
        setPolicies(transformedPolicies);
        setPagination((prev) => ({ ...prev, currentPage: page }));
        setError(null);
      } else {
        setError("Invalid data format received from server");
        setPolicies([]);
      }
    } catch (err) {
      console.error("ECP: Error fetching policies:", err);
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
      console.log("ECP: Searching policies with query:", query);
      const response = await employeeCompensationAPI.searchPolicies({
        q: query,
        page: 1,
        pageSize: pagination.pageSize,
      });
      console.log("ECP: Search response:", response);

      // Handle both expected format and direct array response
      if (response && response.success && Array.isArray(response.policies)) {
        // Transform the policies to ensure consistent data structure
        const transformedPolicies = response.policies.map(policy => ({
          ...policy,
          // Ensure policyHolder is available for company name display
          policyHolder: policy.policyHolder || policy.companyPolicyHolder,
          // Keep original properties for backward compatibility
          companyPolicyHolder: policy.policyHolder || policy.companyPolicyHolder,
          consumerPolicyHolder: policy.consumerPolicyHolder,
        }));
        setPolicies(transformedPolicies);
        setPagination({
          currentPage: response.currentPage || 1,
          pageSize: response.pageSize || pagination.pageSize,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || response.policies.length,
        });
        setError(null);
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        // Transform the policies to ensure consistent data structure
        const transformedPolicies = response.map(policy => ({
          ...policy,
          // Ensure policyHolder is available for company name display
          policyHolder: policy.policyHolder || policy.companyPolicyHolder,
          // Keep original properties for backward compatibility
          companyPolicyHolder: policy.policyHolder || policy.companyPolicyHolder,
          consumerPolicyHolder: policy.consumerPolicyHolder,
        }));
        setPolicies(transformedPolicies);
        setPagination((prev) => ({
          ...prev,
          currentPage: 1,
          totalItems: response.length,
        }));
        setError(null);
      } else {
        console.error("Invalid search response format:", response);
        // Fallback to client-side search if server search fails
        console.log(
          "ECP: Server search failed, falling back to client-side search"
        );
        // Don't set error here, let client-side search handle it
        // setError("Invalid data format received from server");
        // setPolicies([]);
      }
    } catch (err) {
      console.error("Error searching ECP policies:", err);
      // Fallback to client-side search if server search fails
      console.log(
        "ECP: Server search error, falling back to client-side search"
      );
      // Don't set error here, let client-side search handle it
      // setError("Failed to search ECP policies");
      // setPolicies([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

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
      const policyFields = [
        policy.policy_number,
        policy.business_type,
        policy.customer_type,
        policy.email,
        policy.mobile_number,
        policy.plan_name,
        policy.medical_cover,
        policy.net_premium,
        policy.remarks
      ].some(field => field && field.toString().toLowerCase().includes(searchLower));
      const companyName = policy.policyHolder?.company_name || policy.companyPolicyHolder?.company_name || policy.company?.company_name || policy.company_name;
      const companyMatch = companyName && companyName.toLowerCase().includes(searchLower);
      const consumerName = policy.consumerPolicyHolder?.name || policy.consumer?.name || policy.consumer_name;
      const consumerMatch = consumerName && consumerName.toLowerCase().includes(searchLower);
      const insuranceCompanyName = policy.provider?.name;
      const insuranceMatch = insuranceCompanyName && insuranceCompanyName.toLowerCase().includes(searchLower);
      return policyFields || companyMatch || consumerMatch || insuranceMatch;
    });
  }, [filteredPolicies, searchQuery]);

  const toCamelCase = (policy) => ({
    id: policy.id,
    policyNumber: policy.policy_number,
    businessType: policy.business_type,
    customerType: policy.customer_type,
    insuranceCompanyId: policy.insurance_company_id,
    companyId: policy.company_id,
    email: policy.email,
    mobileNumber: policy.mobile_number,
    policyStartDate: policy.policy_start_date,
    policyEndDate: policy.policy_end_date,
    medicalCover: policy.medical_cover,
    netPremium: policy.net_premium,
    gstNumber: policy.gst_number,
    panNumber: policy.pan_number,
    remarks: policy.remarks,
    gst: policy.gst,
    grossPremium: policy.gross_premium,
    policyDocumentPath: policy.policy_document_path,
    status: policy.status,
    createdAt: policy.created_at,
    updatedAt: policy.updated_at,
    policyHolder: policy.policyHolder,
    provider: policy.provider,
    // Keep original properties for backward compatibility
    companyPolicyHolder: policy.policyHolder,
    consumerPolicyHolder: policy.consumerPolicyHolder,
  });

  const handleDelete = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await employeeCompensationAPI.deletePolicy(policyId);
        toast.success("Policy deleted successfully!");
        await fetchPolicies(pagination.currentPage, pagination.pageSize);
        await fetchECPStatistics();
      } catch (err) {
        setError("Failed to delete policy");
        toast.error("Failed to delete policy");
      }
    }
  };

  const handleEdit = (policy) => {
    // Transform the policy data to camelCase for the form
    const transformedPolicy = toCamelCase(policy);
    console.log('ECP: Original policy data:', policy);
    console.log('ECP: Transformed policy data for edit:', transformedPolicy);
    setSelectedPolicy(transformedPolicy);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedPolicy(null);
    setShowModal(false);
  };

  const handlePolicyUpdated = async () => {
    await fetchPolicies(pagination.currentPage, pagination.pageSize);
    await fetchECPStatistics();
    handleModalClose();
  };

  const handlePageChange = async (page) => {
    console.log("ECP: Page changed to:", page);
    await fetchPolicies(page, pagination.pageSize);
  };

  const handlePageSizeChange = async (newPageSize) => {
    console.log("ECP: Page size changed to:", newPageSize);
    await fetchPolicies(1, newPageSize);
  };

  // Statistics Cards Component
  const StatisticsCards = () => {
    if (statsLoading) {
      return (
        <div className="statistics-grid">
          <div className="stat-card loading">
            <Loader size="small" />
          </div>
          <div className="stat-card loading">
            <Loader size="small" />
          </div>
          <div className="stat-card loading">
            <Loader size="small" />
          </div>
        </div>
      );
    }

    if (!statistics) return null;

    // Get ECP statistics from the response
    const totalPolicies = statistics.total_policies || 0;
    const activePolicies = statistics.active_policies || 0;
    const recentPolicies = statistics.recent_policies || 0;

    const activePercentage = statistics.percent_active || 0;
    const recentPercentage = statistics.percent_recent || 0;

    return (
      <div className="statistics-section">
        <div className="statistics-grid">
          {/* Total Policies Card */}
          <div className="stat-card total">
            <div className="stat-icon">
              <BiShield />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{totalPolicies}</h3>
              <p className="stat-label">Total Policies</p>
            </div>
          </div>

          {/* Active Policies Card */}
          <div className="stat-card active">
            <div className="stat-icon">
              <BiTrendingUp />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{activePolicies}</h3>
              <p className="stat-label">Active Policies</p>
              <p className="stat-percentage">{activePercentage}% of total</p>
            </div>
          </div>

          {/* Recent Policies Card */}
          <div className="stat-card recent">
            <div className="stat-icon">
              <BiCalendar />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{recentPolicies}</h3>
              <p className="stat-label">Recent Policies (30 days)</p>
              <p className="stat-percentage">{recentPercentage}% of total</p>
            </div>
          </div>
        </div>
      </div>
    );
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
          policy.policyHolder?.company_name ||
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
    { key: "medical_cover", label: "Medical Cover", sortable: true },
    { key: "net_premium", label: "Net Premium", sortable: true },
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
      <div className="insurance-content">
        <div className="insurance-header">
          <h1 className="insurance-title">Employee Compensation Policies</h1>
          <Button
            variant="contained"
            onClick={() => setShowModal(true)}
            icon={<BiPlus />}
          >
            Add Policy
          </Button>
        </div>

        {/* ECP Statistics */}
        <StatisticsCards />
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
  );
}

export default ECP;
