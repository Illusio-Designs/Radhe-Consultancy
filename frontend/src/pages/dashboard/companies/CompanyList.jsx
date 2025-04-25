import React, { useState, useEffect, useRef } from "react";
import { BiPlus, BiEdit, BiTrash, BiErrorCircle, BiUpload } from "react-icons/bi";
import { companyAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/companies/Vendor.css";
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css'; // Import the CSS for intl-tel-input

const PhoneNumberInput = ({ value, onChange }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const iti = intlTelInput(inputRef.current, {
      initialCountry: 'IN', // Set default country to India
      utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js', // Load utils.js for formatting
    });

    inputRef.current.addEventListener('change', () => {
      onChange(iti.getNumber());
    });

    return () => {
      iti.destroy(); // Cleanup on unmount
    };
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      type="tel"
      placeholder="Enter phone number"
      required
    />
  );
};

const CompanyForm = ({ company, onClose, onCompanyUpdated }) => {
  const [formData, setFormData] = useState({
    company_name: company?.company_name || "",
    owner_name: company?.owner_name || "",
    company_address: company?.company_address || "",
    contact_number: company?.contact_number || "",
    company_email: company?.company_email || "",
    gst_number: company?.gst_number || "",
    pan_number: company?.pan_number || "",
    firm_type: company?.firm_type || "",
  });

  const [files, setFiles] = useState({
    gst_certificate: null,
    pan_card: null
  });

  const [fileNames, setFileNames] = useState({
    gst_certificate: "",
    pan_card: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name || "",
        owner_name: company.owner_name || "",
        company_address: company.company_address || "",
        contact_number: company.contact_number || "",
        company_email: company.company_email || "",
        gst_number: company.gst_number || "",
        pan_number: company.pan_number || "",
        firm_type: company.firm_type || "",
      });
    }
  }, [company]);

  const validateGST = (gst) => {
    // Remove any spaces and convert to uppercase
    gst = gst.replace(/\s/g, "").toUpperCase();

    // GST format: 22AAAAA0000A1Z5
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9]{1}$/;
    return gstRegex.test(gst);
  };

  const handleGSTChange = (e) => {
    let value = e.target.value;

    // Remove any spaces and convert to uppercase
    value = value.replace(/\s/g, "").toUpperCase();

    // Only allow alphanumeric characters
    value = value.replace(/[^A-Z0-9]/g, "");

    // Limit to 15 characters (GST number length)
    value = value.slice(0, 15);

    setFormData((prev) => {
      const newData = {
        ...prev,
        gst_number: value,
      };

      // If GST is valid (15 characters), auto-fill PAN
      if (value.length === 15) {
        // Extract PAN from GST (characters 2-12)
        const pan = value.substring(2, 12);
        newData.pan_number = pan;
      }

      return newData;
    });
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({
        ...prev,
        [fileType]: file
      }));
      setFileNames(prev => ({
        ...prev,
        [fileType]: file.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate GST number
    if (formData.gst_number && !validateGST(formData.gst_number)) {
      setError(
        "Invalid GST number format. Please enter a valid 15-digit GST number."
      );
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      if (company) {
        await companyAPI.updateCompany(company.company_id, submitData);
      } else {
        await companyAPI.createCompany(submitData);
      }
      onCompanyUpdated();
    } catch (err) {
      console.error("Error during submission:", err);
      setError(err.response?.data?.error || "Failed to save company");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "gst_number") {
      handleGSTChange(e);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <>
      {error && <div className="vendor-management-error">{error}</div>}

      <form onSubmit={handleSubmit} className="vendor-management-form">
        <div className="vendor-management-form-grid">
          <div className="vendor-management-form-group">
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Company Name"
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleChange}
              placeholder="Owner Name"
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <textarea
              name="company_address"
              value={formData.company_address}
              onChange={handleChange}
              placeholder="Address"
              required
              className="vendor-management-form-input"
              rows="3"
            />
          </div>

          <div className="form-group">
            <PhoneNumberInput
              value={formData.contact_number}
              onChange={(value) => setFormData(prev => ({ ...prev, contact_number: value }))}
            />
          </div>

          <div className="vendor-management-form-group">
            <input
              type="email"
              name="company_email"
              value={formData.company_email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <input
              type="text"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleChange}
              placeholder="GST Number (15 digits)"
              required
              className="vendor-management-form-input"
              maxLength={15}
            />
          </div>

          {/* GST Certificate Upload */}
          <div className="vendor-management-form-group file-upload-group">
            <label className="file-upload-label">
              <span>GST Certificate</span>
              <div className="file-upload-container">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'gst_certificate')}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="file-upload-input"
                />
                <div className="file-upload-button">
                  <BiUpload /> {fileNames.gst_certificate || 'Upload GST Certificate'}
                </div>
              </div>
            </label>
          </div>

          <div className="vendor-management-form-group">
            <input
              type="text"
              name="pan_number"
              value={formData.pan_number}
              onChange={handleChange}
              placeholder="PAN Number"
              required
              className="vendor-management-form-input"
              readOnly
            />
          </div>

          {/* PAN Card Upload */}
          <div className="vendor-management-form-group file-upload-group">
            <label className="file-upload-label">
              <span>PAN Card</span>
              <div className="file-upload-container">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'pan_card')}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="file-upload-input"
                />
                <div className="file-upload-button">
                  <BiUpload /> {fileNames.pan_card || 'Upload PAN Card'}
                </div>
              </div>
            </label>
          </div>

          <div className="vendor-management-form-group">
            <select
              name="firm_type"
              value={formData.firm_type}
              onChange={handleChange}
              required
              className="vendor-management-form-input"
            >
              <option value="">Select Firm Type</option>
              <option value="Proprietorship">Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="LLP">LLP</option>
              <option value="Private Limited">Private Limited</option>
            </select>
          </div>
        </div>

        <div className="vendor-management-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {company ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </>
  );
};

function CompanyList() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyAPI.getAllCompanies();
      
      // Check if response is an array directly
      if (Array.isArray(response)) {
        setCompanies(response);
        setError(null);
      } 
      // Check if response has data property and it's an array
      else if (response && response.data && Array.isArray(response.data)) {
        setCompanies(response.data);
        setError(null);
      } 
      // Check if response has data property and it's an object with data array
      else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        setCompanies(response.data.data);
        setError(null);
      } else {
        console.error("Invalid response format:", response);
        setError("Invalid data format received from server");
        setCompanies([]);
      }
    } catch (err) {
      setError("Failed to fetch companies");
      console.error(err);
      setCompanies([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000); // Ensure loader is displayed for at least 2000ms
    }
  };

  const handleDelete = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await companyAPI.deleteCompany(companyId);
        await fetchCompanies();
      } catch (err) {
        setError("Failed to delete company");
        console.error(err);
      }
    }
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedCompany(null);
    setShowModal(false);
  };

  const handleCompanyUpdated = async () => {
    await fetchCompanies();
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
    { key: "company_name", label: "Company Name", sortable: true },
    { key: "owner_name", label: "Owner Name", sortable: true },
    { key: "contact_number", label: "Contact Number", sortable: true },
    { key: "company_email", label: "Email", sortable: true },
    { key: "gst_number", label: "GST Number", sortable: true },
    { key: "firm_type", label: "Firm Type", sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (_, company) => (
        <div className="vendor-management-actions">
          <ActionButton
            onClick={() => handleEdit(company)}
            variant="secondary"
            size="small"
          >
            <BiEdit />
          </ActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="vendor-management">
      <div className="vendor-management-content">
        <div className="vendor-management-header">
          <h1 className="vendor-management-title">Companies</h1>
          <Button
            variant="contained"
            onClick={() => setShowModal(true)}
            icon={<BiPlus />}
          >
            Add Company
          </Button>
        </div>

        {error && (
          <div className="vendor-management-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}

        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={companies}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedCompany ? "Edit Company" : "Add New Company"}
      >
        <CompanyForm
          company={selectedCompany}
          onClose={handleModalClose}
          onCompanyUpdated={handleCompanyUpdated}
        />
      </Modal>
    </div>
  );
}

export default CompanyList;
