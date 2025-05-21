import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle } from "react-icons/fi";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import Input from "../../../components/common/Input/Input";
import Dropdown from "../../../components/common/Dropdown/Dropdown";
import { userAPI, roleAPI } from "../../../services/api";
import "../../../styles/pages/dashboard/users/User.css";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";

// UserForm component
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
  const { roles } = useData();
  const otherRoles = roles.filter((role) =>
    [
      "User",
      "Vendor_manager",
      "User_manager",
      "Insurance_manager",
      "Compliance_manager",
      "DSC_manager",
    ].includes(role.role_name)
  );

  useEffect(() => {
    if (!user && otherRoles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        role_id: String(otherRoles[0].id),
      }));
    }
  }, [otherRoles, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (otherRoles.length === 0) {
        setError("No valid roles found");
        return;
      }

      const userData = {
        username: formData.username,
        email: formData.email,
        role_id: Number(formData.role_id),
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Form field changed:", { name, value });

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  return (
    <>
      {error && <div className="user-management-error">{error}</div>}

      <form onSubmit={handleSubmit} className="user-management-form">
        <div className="user-management-form-group">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="user-management-form-input"
            placeholder="Enter User Name"
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
            placeholder="Enter Email"
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
              placeholder="Password"
              required={!user}
            />
          </div>
        )}

        <div className="user-management-form-group">
          <select
            name="role_id"
            value={formData.role_id}
            onChange={handleChange}
            className="user-management-form-input"
            required
          >
            <option value="">Select Role</option>
            {otherRoles.map((role) => (
              <option key={role.id} value={String(role.id)}>
                {role.role_name}
              </option>
            ))}
          </select>
        </div>

        <div className="user-management-form-group">
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="user-management-form-input"
            placeholder="Status"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="user-management-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {user ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </>
  );
};

function OtherUserList() {
  const { user } = useAuth();
  const { users, roles, loading, error: dataError, refreshData } = useData();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: "" });

  // Filter users to show Admin and other roles except Company and Consumer
  const otherUsers = users.filter((user) => {
    const roleName = user.Role?.role_name;
    return roleName && roleName !== "Company" && roleName !== "Consumer";
  });

  const getRoleName = (user) => {
    return user.Role?.role_name || "Unknown";
  };

  const filteredUsers = otherUsers.filter((user) => {
    const matchesStatus =
      !filters.status || (user.status || "Active") === filters.status;
    return matchesStatus;
  });

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userAPI.deleteUser(userId);
        await refreshData();
      } catch (err) {
        setError("Failed to delete user");
        console.error(err);
      }
    }
  };

  const handleEdit = (user) => {
    console.log("Editing user:", user); // Debug log
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  const handleUserUpdated = async () => {
    await refreshData();
    handleModalClose();
  };

  const columns = [
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index, pagination = {}) => {
        const { currentPage = 1, pageSize = 10 } = pagination;
        const serialNumber = (currentPage - 1) * pageSize + index + 1;
        return serialNumber;
      },
    },
    { key: "username", label: "User Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role_id",
      label: "Role",
      sortable: true,
      render: (_, user) => getRoleName(user),
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

  return (
    <div className="user-management">
      <div className="user-management-content">
        <div className="user-management-header">
          <h1 className="user-management-title">Other Users</h1>
          <Button
            variant="contained"
            onClick={() => setShowModal(true)}
            icon={<FiPlus />}
          >
            Add User
          </Button>
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
        title={selectedUser ? "Edit User" : "Add User"}
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

export default OtherUserList;
