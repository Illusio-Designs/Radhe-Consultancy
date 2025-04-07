import { useEffect, useState } from 'react';
import { vendorAPI } from '../../../services/api'; // Import vendorAPI
import VendorModal from './VendorModal'; // Import the modal component

function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await vendorAPI.getAllVendors();
      console.log('Vendors fetched:', data);
      // Filter only consumer vendors and ensure ConsumerVendor data exists
      const consumerVendors = data.filter(vendor => 
        vendor.vendor_type === 'Consumer' && vendor.ConsumerVendor !== null
      );
      setVendors(consumerVendors);
    } catch (err) {
      setError('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendorId) => {
    const vendorToEdit = vendors.find(vendor => vendor.vendor_id === vendorId);
    setCurrentVendor(vendorToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = async (vendorId) => {
    try {
      await vendorAPI.deleteVendor(vendorId); // Call the delete API
      setVendors(vendors.filter(vendor => vendor.vendor_id !== vendorId)); // Update the state
      console.log(`Deleted vendor with ID: ${vendorId}`);
    } catch (err) {
      console.error('Failed to delete vendor:', err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentVendor(null); // Reset current vendor
    fetchVendors(); // Refresh the vendor list after closing the modal
  };

  if (loading) return <div>Loading...</div>; // Show loading state
  if (error) return <div>{error}</div>; // Show error message

  return (
    <div>
      <h1>Consumer Vendors</h1>
      <button onClick={() => setIsModalOpen(true)}>Add Vendor</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.length > 0 ? (
            vendors.map(vendor => (
              <tr key={vendor.vendor_id}>
                <td>{vendor.ConsumerVendor.name}</td>
                <td>{vendor.ConsumerVendor.email}</td>
                <td>{vendor.ConsumerVendor.phone_number}</td>
                <td>{vendor.ConsumerVendor.contact_address}</td>
                <td>
                  <button onClick={() => handleEdit(vendor.vendor_id)}>Edit</button>
                  <button onClick={() => handleDelete(vendor.vendor_id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No consumer vendors found.</td>
            </tr>
          )}
        </tbody>
      </table>
      <VendorModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        vendorData={currentVendor} 
        onSave={handleModalClose} 
      />
    </div>
  );
}

export default VendorList;