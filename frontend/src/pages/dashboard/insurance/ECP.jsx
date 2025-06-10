import React, { useState, useEffect, useRef } from "react";
import {
  BiPlus,
  BiEdit,
  BiTrash,
  BiErrorCircle,
  BiUpload,
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
import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select, { components } from "react-select";

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
      const formatDate = (dateStr) => (dateStr ? dateStr.slice(0, 10) : "");
      setFormData({
        businessType: policy.businessType || "",
        customerType: policy.customerType || "",
        insuranceCompanyId: policy.insuranceCompanyId || "",
        companyId: policy.companyId || "",
        policyNumber: policy.policyNumber || "",
        email: policy.email || "",
        mobileNumber: policy.mobileNumber || "",
        policyStartDate: formatDate(policy.policyStartDate),
        policyEndDate: formatDate(policy.policyEndDate),
        medicalCover: policy.medicalCover || "",
        netPremium: policy.netPremium || "",
        gstNumber: policy.gstNumber || "",
        panNumber: policy.panNumber || "",
        remarks: policy.remarks || "",
      });

      setFileNames({
        policyDocument: policy.policyDocumentName || "",
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
      console.error("Error submitting form:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while submitting the form"
      );
      toast.error(
        error.response?.data?.message ||
          "An error occurred while submitting the form"
      );
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
      {error && <div className="insurance-error">{error}</div>}

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

function ECP() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("ECP component mounted");
    fetchPolicies();
  }, []);

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
  });

  const fetchPolicies = async () => {
    try {
      console.log("Fetching policies...");
      setLoading(true);
      const response = await employeeCompensationAPI.getAllPolicies();
      console.log("Policies API response:", response);

      if (response && Array.isArray(response.policies)) {
        const mapped = response.policies.map(toCamelCase);
        setPolicies(mapped);
        setError(null);
      } else {
        console.error("Invalid response format:", response);
        setError("Invalid data format received from server");
        setPolicies([]);
      }
    } catch (err) {
      console.error("Error fetching policies:", err);
      setError("Failed to fetch policies");
      setPolicies([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const handleDelete = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await employeeCompensationAPI.deletePolicy(policyId);
        toast.success("Policy deleted successfully!");
        await fetchPolicies();
      } catch (err) {
        const errorMessage = "Failed to delete policy";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(err);
      }
    }
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setShowModal(true);
  };

  const handleModalClose = () => {
    console.log("Modal closing");
    setSelectedPolicy(null);
    setShowModal(false);
  };

  const handlePolicyUpdated = async () => {
    console.log("Policy updated, refreshing list");
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
        const serialNumber = (currentPage - 1) * pageSize + index + 1;
        return serialNumber;
      },
    },
    { key: "policyNumber", label: "Policy Number", sortable: true },
    { key: "businessType", label: "Business Type", sortable: true },
    { key: "customerType", label: "Customer Type", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "mobileNumber", label: "Mobile Number", sortable: true },
    { key: "medicalCover", label: "Medical Cover", sortable: true },
    { key: "netPremium", label: "Net Premium", sortable: true },
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

        {error && (
          <div className="insurance-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}

        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={policies}
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
  );
}

export default ECP;
