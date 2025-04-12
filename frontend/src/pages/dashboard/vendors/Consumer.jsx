import React, { useState, useEffect } from 'react';
import { BiPlus, BiEdit, BiTrash, BiErrorCircle } from 'react-icons/bi';
import { vendorAPI } from '../../../services/api';
import TableWithControl from '../../../components/common/Table/TableWithControl';
import Button from '../../../components/common/Button/Button';
import ActionButton from '../../../components/common/ActionButton/ActionButton';
import Modal from '../../../components/common/Modal/Modal';
import Loader from '../../../components/common/Loader/Loader';
import '../../../styles/dashboard/Vendor.css';

const ConsumerForm = ({ consumer, onClose, onConsumerUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    dob: '',
    national_id: '',
    contact_address: '',
    vendor_type: 'Consumer',
    office_user_email: '' // Add office user email field
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (consumer) {
        await vendorAPI.updateConsumerVendor(consumer.vendor_id, formData);
      } else {
        await vendorAPI.createConsumerVendor({
          ...formData,
          email: formData.office_user_email
        });
      }
      onConsumerUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save consumer');
    }
  };

  const [error, setError] = useState('');

  useEffect(() => {
    if (consumer) {
      setFormData({
        name: consumer.ConsumerVendor.name || '',
        email: consumer.ConsumerVendor.email || '',
        phone_number: consumer.ConsumerVendor.phone_number || '',
        dob: consumer.ConsumerVendor.dob || '',
        national_id: consumer.ConsumerVendor.national_id || '',
        contact_address: consumer.ConsumerVendor.contact_address || '',
        vendor_type: 'Consumer'
      });
    }
  }, [consumer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      {error && (
        <div className="vendor-management-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="vendor-management-form">
        <div className="vendor-management-form-group">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="vendor-management-form-input"
            placeholder="Name"
            required
          />
        </div>

        {/* Add all other form fields in the same pattern */}
        
        <div className="vendor-management-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{consumer ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </>
  );
};

function ConsumerVendors() {
  const [showModal, setShowModal] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConsumers();
  }, []);

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const data = await vendorAPI.getAllConsumerVendors();
      setConsumers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch consumers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this consumer?')) {
      try {
        await vendorAPI.deleteConsumerVendor(vendorId);
        await fetchConsumers();
      } catch (err) {
        setError('Failed to delete consumer');
        console.error(err);
      }
    }
  };

  const handleEdit = (consumer) => {
    setSelectedConsumer(consumer);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedConsumer(null);
    setShowModal(false);
  };

  const handleConsumerUpdated = async () => {
    await fetchConsumers();
    handleModalClose();
  };

  const columns = [
    { 
      key: 'sr_no', 
      label: 'Sr No.', 
      sortable: true, 
      render: (_, __, index, pagination = {}) => {
        const { currentPage = 1, pageSize = 10 } = pagination;
        const serialNumber = (currentPage - 1) * pageSize + index + 1;
        return serialNumber;
      }
    },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone_number', label: 'Phone Number', sortable: true },
    { key: 'national_id', label: 'National ID', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, consumer) => (
        <div className="vendor-management-actions">
          <ActionButton
            onClick={() => handleEdit(consumer)}
            variant="secondary"
            size="small"
          >
            <BiEdit />
          </ActionButton>
          <ActionButton
            onClick={() => handleDelete(consumer.vendor_id)}
            variant="danger"
            size="small"
          >
            <BiTrash />
          </ActionButton>
        </div>
      )
    }
  ];

  return (
    <div className="vendor-management">
      <div className="vendor-management-content">
        <div className="vendor-management-header">
          <h1 className="vendor-management-title">Consumer Vendors</h1>
          <Button 
            variant="contained" 
            onClick={() => setShowModal(true)} 
            icon={<BiPlus />}
          >
            Add Consumer
          </Button>
        </div>

        {error && (
          <div className="vendor-management-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}

        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={consumers}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedConsumer ? 'Edit Consumer' : 'Add New Consumer'}
      >
        <ConsumerForm 
          consumer={selectedConsumer} 
          onClose={handleModalClose} 
          onConsumerUpdated={handleConsumerUpdated} 
        />
      </Modal>
    </div>
  );
}

export default ConsumerVendors;