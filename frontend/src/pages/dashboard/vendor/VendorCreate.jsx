import { useState } from 'react';
import { vendorAPI } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

function VendorCreate() {
  const [formData, setFormData] = useState({
    vendor_name: '',
    // Add other vendor fields as necessary
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      await vendorAPI.createVendor(formData);
      navigate('/dashboard/vendors'); // Redirect to vendor list after creation
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Vendor</h1>
      {error && <div>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="vendor_name">Vendor Name</label>
          <input
            type="text"
            id="vendor_name"
            name="vendor_name"
            value={formData.vendor_name}
            onChange={handleChange}
            required
          />
        </div>
        {/* Add other fields as necessary */}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Vendor'}
        </button>
      </form>
    </div>
  );
}

export default VendorCreate;
