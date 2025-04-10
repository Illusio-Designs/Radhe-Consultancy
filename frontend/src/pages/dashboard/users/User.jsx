import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import TableWithControl from '../../../components/common/Table/TableWithControl';
import Button from '../../../components/common/Button/Button';
import ActionButton from '../../../components/common/ActionButton/ActionButton';
import Modal from '../../../components/common/Modal/Modal';
import Loader from '../../../components/common/Loader/Loader';
import { userAPI } from '../../../services/api';
import '../../../styles/dashboard/User.css';

const UserForm = ({ user, onClose, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: 2, // Default to User role
    user_type_id: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.username || '',
        email: user.email || '',
        password: '',
        role_id: user.role_id || 2,
        user_type_id: user.user_type_id || null
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        const updatedUser = await userAPI.updateUser(user.user_id, {
          username: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          role_id: formData.role_id,
          user_type_id: formData.user_type_id
        });
        onUserUpdated(updatedUser);
      } else {
        const newUser = await userAPI.createUser({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          role_id: formData.role_id,
          user_type_id: formData.user_type_id
        });
        onUserUpdated(newUser);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user');
    }
  };

  return (
    <>
      {error && (
        <div className="user-management-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="user-management-form">
        <div className="user-management-form-group">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="user-management-form-input"
            placeholder='Enter Your Name'
            required
          />
        </div>

        <div className="user-management-form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="user-management-form-input"
            placeholder='Enter Your Email'
            required
          />
        </div>

        {!user && (
          <div className="user-management-form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="user-management-form-input"
              placeholder='Password'
              required={!user}
            />
          </div>
        )}

        <div className="user-management-form-group">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Role"
            className="user-management-form-input"
          >
          </select>
        </div>

        <div className="user-management-form-group">
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="user-management-form-input"
            placeholder = "Status"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="user-management-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{user ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </>
  );
};

function UserList() {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ role: '', status: '' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = !filters.role || (user.role_id === 1 ? 'admin' : 'user').toLowerCase() === filters.role.toLowerCase();
    const matchesStatus = !filters.status || (user.status || 'Active') === filters.status;
    return matchesRole && matchesStatus;
  });

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId);
        await fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      }
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  const handleUserUpdated = async () => {
    await fetchUsers();
    handleModalClose();
  };

  const columns = [
    { key: 'username', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'role_id',
      label: 'Role',
      sortable: true,
      render: (value) => value === 1 ? 'Admin' : 'User'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          value === 'Active' ? 'user-management-status-active' : 'user-management-status-inactive'
        }`}>
          {value || 'Active'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <div className="user-management-actions">
          <ActionButton
            onClick={() => handleEdit(user)}
            variant="secondary"
            size="small"
          >
            <FiEdit2 />
          </ActionButton>
          <ActionButton
            onClick={() => handleDelete(user.user_id)}
            variant="danger"
            size="small"
          >
            <FiTrash2 />
          </ActionButton>
        </div>
      )
    }
  ];

  return (
    <div className="user-management">
      <div className="user-management-content">
        <div className="user-management-header">
          <h1 className="user-management-title">User Management</h1>
          <Button variant="contained" onClick={() => setShowModal(true)} icon={<FiPlus />}>Add User</Button>
        </div>

        {error && (
          <div className="user-management-error">
            <FiAlertCircle className="inline mr-2" /> {error}
          </div>
        )}

        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={filteredUsers}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedUser ? 'Edit User' : 'Add New User'}
      >
        <UserForm user={selectedUser} onClose={handleModalClose} onUserUpdated={handleUserUpdated} />
      </Modal>
    </div>
  );
}

export default UserList;