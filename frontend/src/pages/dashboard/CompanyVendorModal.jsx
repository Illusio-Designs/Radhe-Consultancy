import React from 'react';

const CompanyVendorModal = ({ isOpen, onClose, vendorData, onSave, formData, handleInputChange }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{vendorData ? 'Edit Company Vendor' : 'Add Company Vendor'}</h2>
        <form onSubmit={onSave}>
          <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="Company Name" required />
          <input type="text" name="owner_name" value={formData.owner_name} onChange={handleInputChange} placeholder="Owner Name" required />
          <input type="text" name="company_address" value={formData.company_address} onChange={handleInputChange} placeholder="Company Address" required />
          <input type="text" name="contact_number" value={formData.contact_number} onChange={handleInputChange} placeholder="Contact Number" required />
          <input type="email" name="company_email" value={formData.company_email} onChange={handleInputChange} placeholder="Company Email" required />
          <input type="text" name="gst_number" value={formData.gst_number} onChange={handleInputChange} placeholder="GST Number" />
          <input type="text" name="pan_number" value={formData.pan_number} onChange={handleInputChange} placeholder="PAN Number" />
          <select name="firm_type" value={formData.firm_type} onChange={handleInputChange} required>
            <option value="">Select Firm Type</option>
            <option value="Partnership">Partnership</option>
            <option value="LLP">LLP</option>
            <option value="Private Limited">Private Limited</option>
            <option value="Public Limited">Public Limited</option>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
          </select>
          <button type="submit">{vendorData ? 'Update' : 'Add'} Vendor</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default CompanyVendorModal; 