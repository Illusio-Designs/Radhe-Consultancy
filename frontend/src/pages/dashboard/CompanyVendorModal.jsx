import React from 'react';

const CompanyVendorModal = ({ isOpen, onClose, vendorData, onSave, formData, handleInputChange }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{vendorData ? 'Edit Company Vendor' : 'Add Company Vendor'}</h2>
        <form onSubmit={onSave}>
          <div className="form-group">
            <label htmlFor="company_name">Company Name</label>
            <input type="text" id="company_name" name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="Company Name" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="owner_name">Owner Name</label>
            <input type="text" id="owner_name" name="owner_name" value={formData.owner_name} onChange={handleInputChange} placeholder="Owner Name" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="company_address">Company Address</label>
            <input type="text" id="company_address" name="company_address" value={formData.company_address} onChange={handleInputChange} placeholder="Company Address" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact_number">Contact Number</label>
            <input type="text" id="contact_number" name="contact_number" value={formData.contact_number} onChange={handleInputChange} placeholder="Contact Number" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="company_email">Company Email</label>
            <input type="email" id="company_email" name="company_email" value={formData.company_email} onChange={handleInputChange} placeholder="Company Email" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="company_website">Company Website</label>
            <input type="url" id="company_website" name="company_website" value={formData.company_website} onChange={handleInputChange} placeholder="Company Website (e.g. https://company.com)" />
          </div>
          
          <div className="form-group">
            <label htmlFor="gst_number">GST Number</label>
            <input type="text" id="gst_number" name="gst_number" value={formData.gst_number} onChange={handleInputChange} placeholder="GST Number" />
          </div>
          
          <div className="form-group">
            <label htmlFor="pan_number">PAN Number</label>
            <input type="text" id="pan_number" name="pan_number" value={formData.pan_number} onChange={handleInputChange} placeholder="PAN Number" />
          </div>
          
          <div className="form-group">
            <label htmlFor="firm_type">Firm Type</label>
            <select id="firm_type" name="firm_type" value={formData.firm_type} onChange={handleInputChange} required>
              <option value="">Select Firm Type</option>
              <option value="Partnership">Partnership</option>
              <option value="LLP">LLP</option>
              <option value="Private Limited">Private Limited</option>
              <option value="Public Limited">Public Limited</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit">{vendorData ? 'Update' : 'Add'} Vendor</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyVendorModal; 