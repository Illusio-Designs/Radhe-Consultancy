import React, { useState, useEffect } from 'react';
import { BiPlus, BiEdit, BiTrash, BiErrorCircle, BiX } from 'react-icons/bi';
import { vendorAPI } from '../../../services/api';
import TableWithControl from '../../../components/common/Table/TableWithControl';
import Modal from '../../../components/common/Modal/Modal';

function ConsumerVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    dob: '',
    national_id: '',
    contact_address: '',
    vendor_type: 'Consumer'
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorAPI.getAllVendors();
      const consumerVendors = data.filter(vendor => 
        vendor.vendor_type === 'Consumer' && vendor.ConsumerVendor !== null
      );
      setVendors(consumerVendors);
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
        await vendorAPI.updateVendor(selectedVendor.vendor_id, formData);
      } else {
        await vendorAPI.createVendor(formData);
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
      name: vendor.ConsumerVendor.name || '',
      email: vendor.ConsumerVendor.email || '',
      phone_number: vendor.ConsumerVendor.phone_number || '',
      dob: vendor.ConsumerVendor.dob ? vendor.ConsumerVendor.dob.split('T')[0] : '',
      national_id: vendor.ConsumerVendor.national_id || '',
      contact_address: vendor.ConsumerVendor.contact_address || '',
      vendor_type: 'Consumer'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorAPI.deleteVendor(vendorId);
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
      name: '',
      email: '',
      phone_number: '',
      dob: '',
      national_id: '',
      contact_address: '',
      vendor_type: 'Consumer'
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
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone Number', accessor: 'phone_number' },
    { header: 'Address', accessor: 'contact_address' },
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
    ...vendor.ConsumerVendor,
    vendor_id: vendor.vendor_id
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Consumer Vendors</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
        >
          <BiPlus /> Add Consumer Vendor
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
        title={selectedVendor ? 'Edit Consumer Vendor' : 'Add Consumer Vendor'}
        size="lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedVendor ? 'Edit Consumer Vendor' : 'Add Consumer Vendor'}
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
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              placeholder="Date of Birth"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <input
              type="text"
              name="national_id"
              value={formData.national_id}
              onChange={handleInputChange}
              placeholder="National ID"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <textarea
              name="contact_address"
              value={formData.contact_address}
              onChange={handleInputChange}
              placeholder="Contact Address"
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
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

export default ConsumerVendors;