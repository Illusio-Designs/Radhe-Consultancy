import React, { useState, useEffect } from 'react';
import { BiPlus, BiEdit, BiTrash, BiErrorCircle, BiX } from 'react-icons/bi';
import { companyVendorAPI } from '../../../services/api';
import TableWithControl from '../../../components/common/Table/TableWithControl';
import Modal from '../../../components/common/Modal/Modal';

function CompanyVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    owner_name: '',
    company_address: '',
    contact_number: '',
    company_email: '',
    gst_number: '',
    pan_number: '',
    firm_type: '',
    vendor_type: 'Company'
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await companyVendorAPI.getAllCompanyVendors();
      const companyVendors = data.filter(vendor => 
        vendor.vendor_type === 'Company' && vendor.CompanyVendor !== null
      );
      setVendors(companyVendors);
      setError('');
    } catch (err) {
      setError('Failed to fetch vendors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (selectedVendor) {
        await companyVendorAPI.updateCompanyVendor(selectedVendor.vendor_id, formData);
      } else {
        await companyVendorAPI.createCompanyVendor(formData);
      }
      await fetchVendors();
      handleModalClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      company_name: vendor.CompanyVendor.company_name || '',
      owner_name: vendor.CompanyVendor.owner_name || '',
      company_address: vendor.CompanyVendor.company_address || '',
      contact_number: vendor.CompanyVendor.contact_number || '',
      company_email: vendor.CompanyVendor.company_email || '',
      gst_number: vendor.CompanyVendor.gst_number || '',
      pan_number: vendor.CompanyVendor.pan_number || '',
      firm_type: vendor.CompanyVendor.firm_type || '',
      vendor_type: 'Company'
    });
    setIsModalOpen(true);
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

  const handleModalClose = () => {
    setSelectedVendor(null);
    setFormData({
      company_name: '',
      owner_name: '',
      company_address: '',
      contact_number: '',
      company_email: '',
      gst_number: '',
      pan_number: '',
      firm_type: '',
      vendor_type: 'Company'
    });
    setIsModalOpen(false);
  };

  if (loading && !vendors.length) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const columns = [
    { header: 'Company Name', accessor: 'company_name' },
    { header: 'Owner Name', accessor: 'owner_name' },
    { header: 'Contact Number', accessor: 'contact_number' },
    { header: 'Email', accessor: 'company_email' },
    { header: 'GST Number', accessor: 'gst_number' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-3">
          <button onClick={() => handleEdit(row)} className="text-primary-600 hover:text-primary-900">
            <BiEdit className="w-5 h-5" />
          </button>
          <button onClick={() => handleDelete(row.vendor_id)} className="text-red-600 hover:text-red-900">
            <BiTrash className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  const tableData = vendors.map(vendor => ({
    ...vendor.CompanyVendor,
    vendor_id: vendor.vendor_id
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Company Vendors</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
        >
          <BiPlus /> Add Company Vendor
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 flex items-center gap-2">
          <BiErrorCircle />
          {error}
        </div>
      )}

      <TableWithControl
        data={tableData}
        columns={columns}
        pageSizeOptions={[10, 20, 50]}
        defaultPageSize={10}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedVendor ? 'Edit Company Vendor' : 'Add Company Vendor'}
        size="lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedVendor ? 'Edit Company Vendor' : 'Add Company Vendor'}
          </h3>
          <button
            onClick={handleModalClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <BiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="Company Name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleInputChange}
              placeholder="Owner Name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <textarea
              name="company_address"
              value={formData.company_address}
              onChange={handleInputChange}
              placeholder="Company Address"
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              placeholder="Contact Number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <input
              type="email"
              name="company_email"
              value={formData.company_email}
              onChange={handleInputChange}
              placeholder="Company Email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <input
              type="text"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleInputChange}
              placeholder="GST Number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <input
              type="text"
              name="pan_number"
              value={formData.pan_number}
              onChange={handleInputChange}
              placeholder="PAN Number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <select
              name="firm_type"
              value={formData.firm_type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value="">Select Firm Type</option>
              <option value="Partnership">Partnership</option>
              <option value="LLP">LLP</option>
              <option value="Private Limited">Private Limited</option>
              <option value="Public Limited">Public Limited</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
              disabled={loading}
            >
              {loading ? 'Saving...' : (selectedVendor ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CompanyVendors;