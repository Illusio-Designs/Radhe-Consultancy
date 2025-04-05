import { useState, useEffect } from 'react';
import { vendorAPI } from '../../../services/api'; // Import vendorAPI

function VendorModal({ isOpen, onClose, vendorData, onSave }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone_number: '',
    dob: '',
    national_id: '',
    contact_address: '',
    vendor_type: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendorData) {
      console.log('Editing vendor data:', vendorData); // Log vendor data for debugging
      setFormData({
        email: vendorData.ConsumerVendor?.email || '',
        name: vendorData.ConsumerVendor?.name || '',
        phone_number: vendorData.ConsumerVendor?.phone_number || '',
        dob: vendorData.ConsumerVendor?.dob ? vendorData.ConsumerVendor.dob.split('T')[0] : '', // Format date
        national_id: vendorData.ConsumerVendor?.national_id || '',
        contact_address: vendorData.ConsumerVendor?.contact_address || '',
        vendor_type: vendorData.vendor_type || '',
      });
    } else {
      setFormData({
        email: '',
        name: '',
        phone_number: '',
        dob: '',
        national_id: '',
        contact_address: '',
        vendor_type: '',
      });
    }
  }, [vendorData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (vendorData) {
        // Update existing vendor
        await vendorAPI.updateVendor(vendorData.vendor_id, formData);
      } else {
        // Create new vendor
        await vendorAPI.createVendor(formData);
      }
      onSave(); // Call the onSave function to refresh the vendor list
      onClose(); // Close the modal
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save vendor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{vendorData ? 'Edit Vendor' : 'Create Vendor'}</h2>
        {error && <div>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="vendor_type">Vendor Type</label>
            <input
              type="text"
              id="vendor_type"
              name="vendor_type"
              value={formData.vendor_type}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="national_id">National ID</label>
            <input
              type="text"
              id="national_id"
              name="national_id"
              value={formData.national_id}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="contact_address">Contact Address</label>
            <input
              type="text"
              id="contact_address"
              name="contact_address"
              value={formData.contact_address}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (vendorData ? 'Update Vendor' : 'Create Vendor')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VendorModal; 