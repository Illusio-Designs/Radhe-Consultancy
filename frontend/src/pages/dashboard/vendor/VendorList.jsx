import { useEffect, useState } from 'react';
import { vendorAPI } from '../../../services/api';

function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await vendorAPI.getAllVendors();
        setVendors(data);
      } catch (error) {
        setError('Failed to fetch vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Vendor List</h1>
      <ul>
        {vendors.map(vendor => (
          <li key={vendor.vendor_id}>{vendor.vendor_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default VendorList;
