import React, { useState, useEffect } from "react";
import { BiPlus, BiEdit, BiTrash, BiErrorCircle, BiUpload } from "react-icons/bi";
import { vehiclePolicyAPI, insuranceCompanyAPI, employeeCompensationAPI } from "../../../services/api";
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
    remarks: ""
  });
  const [files, setFiles] = useState({ policyDocument: null });
  const [fileNames, setFileNames] = useState({ policyDocument: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [gst, setGst] = useState(0);
  const [grossPremium, setGrossPremium] = useState(0);

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
        policyStartDate: policy.policy_start_date ? policy.policy_start_date.slice(0, 10) : "",
        policyEndDate: policy.policy_end_date ? policy.policy_end_date.slice(0, 10) : "",
        subProduct: policy.sub_product || "",
        vehicleNumber: policy.vehicle_number || "",
        segment: policy.segment || "",
        manufacturingCompany: policy.manufacturing_company || "",
        model: policy.model || "",
        manufacturingYear: policy.manufacturing_year || "",
        idv: policy.idv || "",
        netPremium: policy.net_premium || "",
        remarks: policy.remarks || ""
      });
      setFileNames({ policyDocument: policy.policy_document_path || "" });
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
          setCompanies([]);
        }
      } catch (err) {
        setCompanies([]);
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
        const companies = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];
        setInsuranceCompanies(companies);
      } catch {
        setInsuranceCompanies([]);
      }
    };
    fetchICs();
  }, []);

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
    setFormData((prev) => ({
      ...prev,
      companyId: selectedCompanyId,
      email: selectedCompany ? selectedCompany.company_email : "",
      mobileNumber: selectedCompany ? selectedCompany.contact_number : ""
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
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
    console.log("[Vehicle] Submitting form with data:", formData);
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
      "netPremium"
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
    try {
      const submitData = new FormData();
      submitData.append("business_type", formData.businessType);
      submitData.append("customer_type", formData.customerType);
      submitData.append("insurance_company_id", formData.insuranceCompanyId);
      if (formData.companyId) submitData.append("company_id", formData.companyId);
      if (formData.consumerId) submitData.append("consumer_id", formData.consumerId);
      submitData.append("policy_number", formData.policyNumber);
      submitData.append("email", formData.email);
      submitData.append("mobile_number", formData.mobileNumber);
      submitData.append("policy_start_date", formData.policyStartDate);
      submitData.append("policy_end_date", formData.policyEndDate);
      submitData.append("sub_product", formData.subProduct);
      submitData.append("vehicle_number", formData.vehicleNumber);
      submitData.append("segment", formData.segment);
      submitData.append("manufacturing_company", formData.manufacturingCompany);
      submitData.append("model", formData.model);
      submitData.append("manufacturing_year", formData.manufacturingYear);
      submitData.append("idv", formData.idv);
      submitData.append("net_premium", formData.netPremium);
      submitData.append("gst", gst);
      submitData.append("gross_premium", grossPremium);
      submitData.append("remarks", formData.remarks);
      if (files.policyDocument) {
        submitData.append("policyDocument", files.policyDocument);
      }
      console.log("[Vehicle] Submitting FormData:", Array.from(submitData.entries()));
      if (policy) {
        const resp = await vehiclePolicyAPI.updatePolicy(policy.id, submitData);
        console.log("[Vehicle] Update response:", resp);
        toast.success("Policy updated successfully!");
      } else {
        const resp = await vehiclePolicyAPI.createPolicy(submitData);
        console.log("[Vehicle] Create response:", resp);
        toast.success("Policy created successfully!");
      }
      onPolicyUpdated();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to save policy");
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to save policy");
      console.error("[Vehicle] API error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="insurance-form">
      {error && <div className="insurance-error">{error}</div>}
      <div className="insurance-form-grid">
        <div className="insurance-form-group">
          <select
            name="companyId"
            value={formData.companyId}
            onChange={handleCompanyChange}
            className="insurance-form-input"
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.company_name}
              </option>
            ))}
          </select>
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
          <select
            name="insuranceCompanyId"
            value={formData.insuranceCompanyId}
            onChange={handleChange}
            className="insurance-form-input"
            required
          >
            <option value="">Select Insurance Company</option>
            {insuranceCompanies.map((ic) => (
              <option key={ic.id} value={ic.id}>{ic.name}</option>
            ))}
          </select>
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
                <BiUpload /> {fileNames.policyDocument || "Upload Policy Document"}
              </div>
            </div>
          </label>
        </div>
        <div className="insurance-form-group" style={{ gridColumn: "span 2" }}>
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
  );
};

function Vehicle() {
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
      const response = await vehiclePolicyAPI.getAllPolicies();
      if (response && Array.isArray(response.policies)) {
        setPolicies(response.policies);
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
    { key: "sr_no", label: "Sr No.", sortable: true, render: (_, __, index, pagination = {}) => {
      const { currentPage = 1, pageSize = 10 } = pagination;
      return (currentPage - 1) * pageSize + index + 1;
    }},
    { key: "policy_number", label: "Policy Number", sortable: true },
    { key: "business_type", label: "Business Type", sortable: true },
    { key: "customer_type", label: "Customer Type", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "mobile_number", label: "Mobile Number", sortable: true },
    { key: "net_premium", label: "Net Premium", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "actions", label: "Actions", render: (_, policy) => (
      <div className="insurance-actions">
        <ActionButton onClick={() => handleEdit(policy)} variant="secondary" size="small"><BiEdit /></ActionButton>
        <ActionButton onClick={() => handleDelete(policy.id)} variant="danger" size="small"><BiTrash /></ActionButton>
      </div>
    )}
  ];

  return (
    <div className="insurance-container">
      <div className="insurance-content">
        <div className="insurance-header">
          <h1 className="insurance-title">Vehicle Insurance Policies</h1>
          <Button variant="contained" onClick={() => setShowModal(true)} icon={<BiPlus />}>Add Policy</Button>
        </div>
        {error && <div className="insurance-error"><BiErrorCircle className="inline mr-2" /> {error}</div>}
        {loading ? <Loader size="large" color="primary" /> : <TableWithControl data={policies} columns={columns} defaultPageSize={10} />}
      </div>
      <Modal isOpen={showModal} onClose={handleModalClose} title={selectedPolicy ? "Edit Policy" : "Add New Policy"}>
        <PolicyForm policy={selectedPolicy} onClose={handleModalClose} onPolicyUpdated={handlePolicyUpdated} />
      </Modal>
    </div>
  );
}

export default Vehicle; 