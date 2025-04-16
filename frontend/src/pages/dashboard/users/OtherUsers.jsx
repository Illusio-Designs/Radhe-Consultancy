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
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const rolesData = await roleAPI.getAllRoles();
        console.log("Fetched roles:", rolesData); // Debug log

        // Filter out Company and Consumer roles
        const otherRoles = rolesData.filter(
          (role) => !["Company", "Consumer"].includes(role.role_name)
        );
        setRoles(otherRoles);

        if (!user && !formData.role_id && otherRoles.length > 0) {
          const defaultRole =
            otherRoles.find((role) => role.id === 2) || otherRoles[0];
          setFormData((prev) => ({
            ...prev,
            role_id: String(defaultRole.id),
          }));
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

  useEffect(() => {
    if (user) {
      console.log("Setting form data for user:", user);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role_id: user.role_id ? String(user.role_id) : "",
        user_type_id: user.user_type_id || 1,
        status: user.status || "Active",
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        role_id: "",
        user_type_id: 1,
        status: "Active",
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.role_id) {
        setError("Please select a valid role");
        return;
      }

      const roleId = Number(formData.role_id);
      if (isNaN(roleId)) {
        setError("Selected role ID is not a valid number");
        return;
      }

      const roleExists = roles.some((role) => role && role.id === roleId);
      if (!roleExists) {
        setError("Selected role is not valid");
        return;
      }

      const userData = {
        username: formData.username,
        email: formData.email,
        role_id: roleId,
        user_type_id: formData.user_type_id,
        status: formData.status,
      };

      if (formData.password && !user) {
        userData.password = formData.password;
      }

      if (user) {
        const updatedUser = await userAPI.updateUser(user.user_id, userData);
        onUserUpdated(updatedUser);
      } else {
        const newUser = await userAPI.createUser(userData);
        onUserUpdated(newUser);
      }
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
            placeholder="Enter Your Name"
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
            placeholder="Enter Your Email"
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
          {loadingRoles ? (
            <Loader size="small" />
          ) : (
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
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
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ role: "", status: "" });

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesData = await roleAPI.getAllRoles();
      setRoles(rolesData);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to fetch roles");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userAPI.getAllUsers();
      // Filter out users with role_id 5 (Company) and 6 (Consumer)
      const otherUsers = allUsers.filter(
        (user) => user.role_id !== 5 && user.role_id !== 6
      );
      setUsers(otherUsers);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
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
    console.log("Editing user:", user); // Debug log
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
        const serialNumber = (currentPage - 1) * pageSize + index + 1;
        return serialNumber;
      },
    },
    { key: "username", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role_id",
      label: "Role",
      sortable: true,
      render: (value) => {
        const role = roles.find(r => r.id === value);
        return role ? role.role_name : "Unknown Role";
      },
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
          <h1 className="user-management-title">Employee User Management</h1>
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
            data={users}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedUser ? "Edit User" : "Add New User"}
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
