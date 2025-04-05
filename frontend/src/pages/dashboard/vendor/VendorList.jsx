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
    const fetchVendors = async () => {
      try {
        const data = await vendorAPI.getAllVendors(); // Fetch all vendors
        console.log('Vendors fetched:', data); // Log the fetched vendors
        setVendors(data); // Set the vendors state
      } catch (err) {
        setError('Failed to fetch vendors');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

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
      <h1>Vendor List</h1>
      <button onClick={() => setIsModalOpen(true)}>Add Vendor</button>
      <table>
        <thead>
          <tr>
            <th>Vendor ID</th>
            <th>Vendor Name</th>
            <th>Vendor Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.length > 0 ? (
            vendors.map(vendor => (
              <tr key={vendor.vendor_id}>
                <td>{vendor.vendor_id}</td>
                <td>{vendor.ConsumerVendor ? vendor.ConsumerVendor.name : 'Unnamed Vendor'}</td>
                <td>{vendor.vendor_type}</td>
                <td>
                  <button onClick={() => handleEdit(vendor.vendor_id)}>Edit</button>
                  <button onClick={() => handleDelete(vendor.vendor_id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No vendors found.</td> // Message if no vendors are available
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