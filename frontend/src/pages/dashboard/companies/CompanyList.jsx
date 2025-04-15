import React, { useState, useEffect } from "react";
import { BiPlus, BiEdit, BiTrash, BiErrorCircle } from "react-icons/bi";
import { companyVendorAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/dashboard/Vendor.css";

const CompanyForm = ({ company, onClose, onCompanyUpdated }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    owner_name: "",
    company_address: "",
    contact_number: "",
    company_email: "",
    gst_number: "",
    pan_number: "",
    firm_type: "",
    vendor_type: "Company",
  });

  const [error, setError] = useState("");

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
        vendor_type: "Company",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate GST number
    if (formData.gst_number && !validateGST(formData.gst_number)) {
      setError(
        "Invalid GST number format. Please enter a valid 15-digit GST number."
      );
      return;
    }

    try {
      if (company) {
        // For updates, only send the changed fields
        const updateData = {
          company_name: formData.company_name,
          owner_name: formData.owner_name,
          company_address: formData.company_address,
          contact_number: formData.contact_number,
          company_email: formData.company_email,
          gst_number: formData.gst_number,
          pan_number: formData.pan_number,
          firm_type: formData.firm_type,
        };
        await companyVendorAPI.updateCompanyVendor(
          company.vendor_id,
          updateData
        );
      } else {
        // For new companies
        await companyVendorAPI.createCompanyVendor(formData);
      }
      onCompanyUpdated();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save company");
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
            <input
              type="text"
              name="company_address"
              value={formData.company_address}
              onChange={handleChange}
              placeholder="Company Address"
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Contact Number"
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <input
              type="email"
              name="company_email"
              value={formData.company_email}
              onChange={handleChange}
              placeholder="Company Email"
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
          <Button type="submit" variant="contained">
            {company ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </>
  );
};

function CompanyVendors() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      console.log('Fetching company vendors...');
      const response = await companyVendorAPI.getAllCompanyVendors();
      console.log('Company vendors response:', response);

      if (!response || !Array.isArray(response)) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid data format received from server');
      }

      setVendors(response);
      console.log('Vendors set:', response);
      setError(null);
    } catch (err) {
      console.error('Fetch vendors error:', err);
      setError(err.message || 'Failed to fetch vendors');
      setVendors([]); // Reset vendors on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vendorId) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await companyVendorAPI.deleteCompanyVendor(vendorId);
        await fetchVendors();
      } catch (err) {
        setError("Failed to delete vendor");
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
    await fetchVendors();
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
          <ActionButton
            onClick={() => handleDelete(company.vendor_id)}
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
    <div className="vendor-management">
      <div className="vendor-management-content">
        <div className="vendor-management-header">
          <h1 className="vendor-management-title">Company Vendors</h1>
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
            data={vendors}
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

export default CompanyVendors;
