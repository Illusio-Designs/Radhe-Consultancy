import React, { useState, useEffect } from 'react';
import { BiPlus, BiEdit, BiTrash, BiErrorCircle } from 'react-icons/bi';
import { companyVendorAPI } from '../../../services/api';
import TableWithControl from '../../../components/common/Table/TableWithControl';
import Button from '../../../components/common/Button/Button';
import ActionButton from '../../../components/common/ActionButton/ActionButton';
import Modal from '../../../components/common/Modal/Modal';
import Loader from '../../../components/common/Loader/Loader';
import '../../../styles/dashboard/Vendor.css';

const CompanyForm = ({ company, onClose, onCompanyUpdated }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    owner_name: '',
    company_address: '',
    contact_number: '',
    company_email: '',
    gst_number: '',
    pan_number: '',
    firm_type: '',
    vendor_type: 'Company',
    office_user_email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (company) {
        await companyVendorAPI.updateCompanyVendor(company.vendor_id, formData);
      } else {
        await companyVendorAPI.createCompanyVendor({
          ...formData,
          email: formData.office_user_email
        });
      }
      onCompanyUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save company');
    }
  };

  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.CompanyVendor.company_name || '',
        owner_name: company.CompanyVendor.owner_name || '',
        company_address: company.CompanyVendor.company_address || '',
        contact_number: company.CompanyVendor.contact_number || '',
        company_email: company.CompanyVendor.company_email || '',
        gst_number: company.CompanyVendor.gst_number || '',
        pan_number: company.CompanyVendor.pan_number || '',
        firm_type: company.CompanyVendor.firm_type || '',
        vendor_type: 'Company'
      });
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      {error && (
        <div className="vendor-management-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="vendor-management-form">
        <div className="vendor-management-form-grid">
          <div className="vendor-management-form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <label>Owner Name</label>
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleChange}
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <label>Company Address</label>
            <input
              type="text"
              name="company_address"
              value={formData.company_address}
              onChange={handleChange}
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <label>Contact Number</label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <label>Company Email</label>
            <input
              type="email"
              name="company_email"
              value={formData.company_email}
              onChange={handleChange}
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <label>GST Number</label>
            <input
              type="text"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleChange}
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <label>PAN Number</label>
            <input
              type="text"
              name="pan_number"
              value={formData.pan_number}
              onChange={handleChange}
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <label>Firm Type</label>
            <select
              name="firm_type"
              value={formData.firm_type}
              onChange={handleChange}
              required
              className="vendor-management-form-select"
            >
              <option value="">Select Firm Type</option>
              <option value="Proprietorship">Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="LLP">LLP</option>
              <option value="Private Limited">Private Limited</option>
            </select>
          </div>

          <div className="vendor-management-form-group">
            <label>Office User Email</label>
            <input
              type="email"
              name="office_user_email"
              value={formData.office_user_email}
              onChange={handleChange}
              required
              className="vendor-management-form-input"
            />
          </div>
        </div>

        <div className="vendor-management-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {company ? 'Update' : 'Create'}
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
      const data = await companyVendorAPI.getAllCompanyVendors();
      if (!data) {
        throw new Error('No data received');
      }
      setVendors(data);
      setError(null);
    } catch (err) {
      console.error('Fetch vendors error:', err);
      setError(err.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await companyVendorAPI.deleteCompanyVendor(vendorId);
        await fetchVendors();
      } catch (err) {
        setError('Failed to delete vendor');
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
    { key: 'company_name', label: 'Company Name', sortable: true },
    { key: 'owner_name', label: 'Owner Name', sortable: true },
    { key: 'contact_number', label: 'Contact Number', sortable: true },
    { key: 'company_email', label: 'Email', sortable: true },
    { key: 'gst_number', label: 'GST Number', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
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
      )
    }
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
        title={selectedCompany ? 'Edit Company' : 'Add New Company'}
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