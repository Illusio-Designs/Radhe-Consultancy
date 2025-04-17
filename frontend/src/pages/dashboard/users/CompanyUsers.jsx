import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiAlertCircle } from "react-icons/fi";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import { userAPI } from "../../../services/api";
import "../../../styles/pages/dashboard/users/User.css";
import { roleAPI } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";

// UserForm component remains the same as in User.jsx
const UserForm = ({ user, onClose, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    role_id: user?.role_id ? String(user.role_id) : "",
    user_type_id: user?.user_type_id || 1,
    status: user?.status || "Active",
  });
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const rolesData = await roleAPI.getAllRoles();
        const companyRole = rolesData.find(
          (role) => role.role_name === "Company"
        );
        if (companyRole) {
          setRoles([companyRole]);
          if (!user) {
            setFormData((prev) => ({
              ...prev,
              role_id: String(companyRole.id),
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Failed to fetch roles");
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const companyRole = roles[0];
      if (!companyRole) {
        setError("Company role not found");
        return;
      }

      const userData = {
        username: formData.username,
        email: formData.email,
        role_id: Number(companyRole.id),
        user_type_id: formData.user_type_id,
        status: formData.status,
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      if (user) {
        await userAPI.updateUser(user.user_id, userData);
      } else {
        await userAPI.createUser(userData);
      }
      onUserUpdated();
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.response?.data?.error || "Failed to save user");
    }
  };

  return (
    <>
      {error && <div className="user-management-error">{error}</div>}

      <form onSubmit={handleSubmit} className="user-management-form">
        <div className="user-management-form-group">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="user-management-form-input"
            placeholder="Enter Company Name"
            required
          />
        </div>

        <div className="user-management-form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="user-management-form-input"
            placeholder="Enter Company Email"
            required
          />
        </div>

        {!user && (
          <div className="user-management-form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="user-management-form-input"
              placeholder="Password"
              required={!user}
            />
          </div>
        )}

        <div className="user-management-form-group">
          {loadingRoles ? (
            <Loader size="small" />
          ) : (
            <select
              name="role_id"
              value={formData.role_id}
              onChange={(e) =>
                setFormData({ ...formData, role_id: e.target.value })
              }
              className="user-management-form-input"
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) =>
                role && role.id !== undefined ? (
                  <option key={role.id} value={String(role.id)}>
                    {role.role_name || `Role ID: ${role.id}`}
                  </option>
                ) : null
              )}
            </select>
          )}
        </div>

        <div className="user-management-form-group">
          <select
            name="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="user-management-form-input"
            placeholder="Status"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="user-management-form-actions">
          <button type="button" className="btn btn-outlined" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-contained">
            {user ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </>
  );
};

function CompanyUserList() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: "" });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesData = await roleAPI.getAllRoles();
      const companyRole = rolesData.find(
        (role) => role.role_name === "Company"
      );
      if (companyRole) {
        setRoles([companyRole]);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to fetch roles");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userAPI.getAllUsers();
      const companyUsers = allUsers.filter(user => user.role_id === 5); // Example filter for company users
      setUsers(companyUsers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch company users');
      console.error(err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000); // Ensure loader is displayed for at least 2000ms
    }
  };

  const getRoleName = (roleId) => {
    return roleId === 5 ? "Company" : "Unknown";
  };

  const filteredUsers = users.filter((user) => {
    const matchesStatus =
      !filters.status || (user.status || "Active") === filters.status;
    return matchesStatus;
  });

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this company user?")) {
      try {
        await userAPI.deleteUser(userId);
        await fetchUsers();
      } catch (err) {
        setError("Failed to delete user");
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
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index, pagination = {}) => {
        const { currentPage = 1, pageSize = 10 } = pagination;
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    { key: "username", label: "Company Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role_id",
      label: "Role",
      sortable: true,
      render: (value) => getRoleName(value),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value === "Active"
              ? "user-management-status-active"
              : "user-management-status-inactive"
          }`}
        >
          {value || "Active"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
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
      ),
    },
  ];

  if (!user || (user.role !== "admin" && user.role !== "vendor_manager")) {
    return (
      <div className="user-management-error">
        <FiAlertCircle className="inline mr-2" /> You don't have permission to
        access this page.
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-content">
        <div className="user-management-header">
          <h1 className="user-management-title">Company User Management</h1>
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
        title={selectedUser ? "Edit Company" : "Add New Company"}
      >
        <UserForm
          user={selectedUser}
          onClose={handleModalClose}
          onUserUpdated={handleUserUpdated}
        />
      </Modal>
    </div>
  );
}

export default CompanyUserList;
