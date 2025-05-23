import React, { useState, useEffect } from "react";
import {
  BiPlus,
  BiEdit,
  BiTrash,
  BiErrorCircle,
  BiUpload,
} from "react-icons/bi";
import { firePolicyAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import Select from "react-select";
import { toast } from "react-toastify";
import "../../../styles/pages/dashboard/insurance/Insurance.css";

const PolicyForm = ({ policy, onClose, onPolicyUpdated }) => {
  const [formData, setFormData] = useState({
    businessType: "",
    customerType: "",
    insuranceCompanyId: "",
    companyId: null,
    consumerId: null,
    proposer_name: "",
    policyNumber: "",
    email: "",
    mobileNumber: "",
    policyStartDate: "",
    policyEndDate: "",
    totalSumInsured: "",
    gstNumber: "",
    panNumber: "",
    netPremium: "",
    gst: 0,
    grossPremium: 0,
    remarks: "",
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

  useEffect(() => {
    if (policy) {
      setFormData({
        businessType: policy.business_type || "",
        customerType: policy.customer_type || "",
        insuranceCompanyId: policy.insurance_company_id || "",
        companyId: policy.company_id || null,
        consumerId: policy.consumer_id || null,
        proposer_name: policy.proposer_name || "",
        policyNumber: policy.policy_number || "",
        email: policy.email || "",
        mobileNumber: policy.mobile_number || "",
        policyStartDate: policy.policy_start_date
          ? policy.policy_start_date.slice(0, 10)
          : "",
        policyEndDate: policy.policy_end_date
          ? policy.policy_end_date.slice(0, 10)
          : "",
        totalSumInsured: policy.total_sum_insured || "",
        gstNumber: policy.gst_number || "",
        panNumber: policy.pan_number || "",
        netPremium: policy.net_premium || "",
        gst: policy.gst || 0,
        grossPremium: policy.gross_premium || 0,
        remarks: policy.remarks || "",
      });
      setFileNames({ policyDocument: policy.policy_document_path || "" });
    }
  }, [policy]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const companiesResponse = await firePolicyAPI.getActiveCompanies();
        setCompanies(companiesResponse);
        const consumersResponse = await firePolicyAPI.getActiveConsumers();
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
        const data = await firePolicyAPI.getActiveInsuranceCompanies();
        setInsuranceCompanies(data);
      } catch {
        setInsuranceCompanies([]);
      }
    };
    fetchICs();
  }, []);

  useEffect(() => {
    const net = parseFloat(formData.netPremium) || 0;
    const gstVal = +(net * 0.18).toFixed(2);
    setGst(gstVal);
    setGrossPremium(+(net + gstVal).toFixed(2));
  }, [formData.netPremium]);

  const handleHolderChange = (option) => {
    if (!option) {
      setFormData((prev) => ({
        ...prev,
        companyId: null,
        consumerId: null,
        email: "",
        mobileNumber: "",
        proposer_name: "",
        customerType: "",
        gstNumber: "",
        panNumber: "",
      }));
      return;
    }
    const { type, data } = option;
    if (type === "company") {
      setFormData((prev) => ({
        ...prev,
        companyId: Number(data.company_id),
        consumerId: null,
        email: data.company_email,
        mobileNumber: data.contact_number,
        proposer_name: data.company_name,
        customerType: "Organisation",
        gstNumber: data.gst_number || "",
        panNumber: data.pan_number || "",
      }));
    } else if (type === "consumer") {
      setFormData((prev) => ({
        ...prev,
        companyId: null,
        consumerId: Number(data.consumer_id),
        email: data.email,
        mobileNumber: data.phone_number,
        proposer_name: data.name,
        customerType: "Individual",
        gstNumber: "",
        panNumber: "",
      }));
    }
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
      totalSumInsured: "Total Sum Insured",
      netPremium: "Net Premium",
      proposer_name: "Proposer Name",
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([_, label]) => label);
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
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
    if (!hasCompanyId && !hasConsumerId) {
      setError("Please select either a company or a consumer");
      setLoading(false);
      return;
    }
    if (hasCompanyId && hasConsumerId) {
      setError("Please select either a company or a consumer, not both");
      setLoading(false);
      return;
    }
    // Validate file
    if (!policy && !files.policyDocument) {
      setError("Policy document is required for new policies");
      setLoading(false);
      return;
    }
    // Validate dates
    const startDate = new Date(formData.policyStartDate);
    const endDate = new Date(formData.policyEndDate);
    if (endDate <= startDate) {
      setError("Policy end date must be after start date");
      setLoading(false);
      return;
    }
    // Validate numeric fields
    const numericFields = ["totalSumInsured", "netPremium"];
    const invalidNumericFields = numericFields.filter((field) => {
      const value = parseFloat(formData[field]);
      return isNaN(value) || value < 0;
    });
    if (invalidNumericFields.length > 0) {
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
        }
      });
      // Add calculated fields
      submitData.append("gst", gst.toFixed(2));
      submitData.append("gross_premium", grossPremium.toFixed(2));
      // Add file if selected
      if (files.policyDocument) {
        submitData.append(
          "policyDocument",
          files.policyDocument,
          files.policyDocument.name
        );
      }
      let response;
      if (policy) {
        response = await firePolicyAPI.updatePolicy(policy.id, submitData);
        toast.success("Policy updated successfully!");
      } else {
        response = await firePolicyAPI.createPolicy(submitData);
        toast.success("Policy created successfully!");
      }
      onPolicyUpdated();
    } catch (err) {
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

  const insuranceCompanyOptions = insuranceCompanies.map((ic) => ({
    value: ic.id,
    label: ic.name,
  }));

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
              name="proposer_name"
              value={formData.proposer_name}
              readOnly
              className="insurance-form-input"
              placeholder="Organisation Name / Policy Holder Name"
            />
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
            <input
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Mobile Number"
              className="insurance-form-input"
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
            <input
              type="text"
              name="totalSumInsured"
              value={formData.totalSumInsured}
              onChange={handleChange}
              placeholder="Total Sum Insured"
              className="insurance-form-input"
            />
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
    </>
  );
};

function Fire() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await firePolicyAPI.getAllPolicies();
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
      setError("");
      setPolicies([]);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleDelete = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await firePolicyAPI.deletePolicy(policyId);
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
    { key: "policy_number", label: "Policy Number", sortable: true },
    { key: "business_type", label: "Business Type", sortable: true },
    { key: "customer_type", label: "Customer Type", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "mobile_number", label: "Mobile Number", sortable: true },
    { key: "total_sum_insured", label: "Total Sum Insured", sortable: true },
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
    <div className="insurance-container">
      <div className="insurance-content">
        <div className="insurance-header">
          <h1 className="insurance-title">Fire Insurance Policies</h1>
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

export default Fire;
