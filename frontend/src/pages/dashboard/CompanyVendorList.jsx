import React, { useEffect, useState } from 'react';
import { companyVendorAPI } from '../../services/api';
import CompanyVendorModal from './CompanyVendorModal';

const CompanyVendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    owner_name: '',
    company_address: '',
    contact_number: '',
    company_email: '',
    gst_number: '',
    pan_number: '',
    firm_type: '',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const data = await companyVendorAPI.getAllCompanyVendors();
    console.log('Fetched vendors:', data);
    // Filter only company vendors and ensure CompanyVendor data exists
    const companyVendors = data.filter(vendor => 
      vendor.vendor_type === 'Company' && vendor.CompanyVendor !== null
    );
    setVendors(companyVendors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vendorData = { ...formData, vendor_type: 'Company' };
    if (isEditing) {
      await companyVendorAPI.updateCompanyVendor(selectedVendor.vendor_id, vendorData);
    } else {
      await companyVendorAPI.createCompanyVendor(vendorData);
    }
    fetchVendors();
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      owner_name: '',
      company_address: '',
      contact_number: '',
      company_email: '',
      gst_number: '',
      pan_number: '',
      firm_type: '',
    });
    setSelectedVendor(null);
    setIsEditing(false);
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
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (vendorId) => {
    await companyVendorAPI.deleteCompanyVendor(vendorId);
    fetchVendors();
  };

  return (
    <div>
      <h2>Company Vendors</h2>
      <button onClick={() => setIsModalOpen(true)}>Add Vendor</button>
      <table>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Owner Name</th>
            <th>Contact Number</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map(vendor => (
            <tr key={vendor.vendor_id}>
              <td>{vendor.CompanyVendor.company_name}</td>
              <td>{vendor.CompanyVendor.owner_name}</td>
              <td>{vendor.CompanyVendor.contact_number}</td>
              <td>{vendor.CompanyVendor.company_email}</td>
              <td>
                <button onClick={() => handleEdit(vendor)}>Edit</button>
                <button onClick={() => handleDelete(vendor.vendor_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CompanyVendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendorData={selectedVendor}
        onSave={handleSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
      />
    </div>
  );
};

export default CompanyVendorList; 