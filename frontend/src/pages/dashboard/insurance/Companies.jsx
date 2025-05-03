import React, { useState, useEffect } from 'react';
import { BiPlus, BiEdit, BiTrash, BiErrorCircle } from 'react-icons/bi';
import { insuranceCompanyAPI } from '../../../services/api';
import TableWithControl from '../../../components/common/Table/TableWithControl';
import Button from '../../../components/common/Button/Button';
import ActionButton from '../../../components/common/ActionButton/ActionButton';
import Modal from '../../../components/common/Modal/Modal';
import Loader from '../../../components/common/Loader/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../styles/pages/dashboard/insurance/ECP.css';

const CreateInsuranceCompanyModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const created = await insuranceCompanyAPI.createCompany({ name: form.name });
      toast.success('Insurance company created!');
      onCreated(created);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create insurance company';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Insurance Company">
      <form onSubmit={handleSubmit} className="insurance-form insurance-modal-form">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="insurance-form-input" />
        {error && <div className="insurance-error" style={{marginTop:8}}>{error}</div>}
        <div className="insurance-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>Create</Button>
        </div>
      </form>
    </Modal>
  );
};

const EditInsuranceCompanyModal = ({ isOpen, onClose, company, onUpdated }) => {
  const [form, setForm] = useState({ name: company?.name || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({ name: company?.name || '' });
    setError('');
  }, [company]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await insuranceCompanyAPI.updateCompany(company.id, { name: form.name });
      toast.success('Insurance company updated!');
      onUpdated();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update insurance company';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Insurance Company">
      <form onSubmit={handleSubmit} className="insurance-form insurance-modal-form">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="insurance-form-input" />
        {error && <div className="insurance-error" style={{marginTop:8}}>{error}</div>}
        <div className="insurance-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>Update</Button>
        </div>
      </form>
    </Modal>
  );
};

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCompany, setEditCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await insuranceCompanyAPI.getAllCompanies();
      // Support both array and {success, data: array}
      const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
      setCompanies(list);
      setError(null);
    } catch (err) {
      setError('Failed to fetch insurance companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = async () => {
    await fetchCompanies();
  };

  const handleUpdated = async () => {
    await fetchCompanies();
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'created_at', label: 'Created At', sortable: true, render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, company) => (
        <div className="insurance-actions">
          <ActionButton
            onClick={() => { setEditCompany(company); setEditModalOpen(true); }}
            variant="secondary"
            size="small"
          >
            <BiEdit />
          </ActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="insurance">
      <div className="insurance-content">
        <div className="insurance-header">
          <h1 className="insurance-title">Insurance Companies</h1>
          <Button
            variant="contained"
            onClick={() => setShowModal(true)}
            icon={<BiPlus />}
          >
            Add Insurance Company
          </Button>
        </div>
        {error && (
          <div className="insurance-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}
        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={companies}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>
      <CreateInsuranceCompanyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />
      <EditInsuranceCompanyModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        company={editCompany}
        onUpdated={handleUpdated}
      />
    </div>
  );
};

export default Companies; 