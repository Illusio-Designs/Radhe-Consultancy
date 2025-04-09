import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiX } from 'react-icons/fi';
import { companyVendorAPI } from '../../../services/api';

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Company Vendors</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
        >
          <FiPlus /> Add Company Vendor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 flex items-center gap-2">
            <FiAlertCircle />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor.vendor_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{vendor.CompanyVendor.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vendor.CompanyVendor.owner_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vendor.CompanyVendor.contact_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vendor.CompanyVendor.company_email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vendor.CompanyVendor.gst_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.vendor_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!vendors.length && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No company vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedVendor ? 'Edit Company Vendor' : 'Add Company Vendor'}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company Address</label>
                <textarea
                  name="company_address"
                  value={formData.company_address}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company Email</label>
                <input
                  type="email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">GST Number</label>
                <input
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                <input
                  type="text"
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Firm Type</label>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyVendors;