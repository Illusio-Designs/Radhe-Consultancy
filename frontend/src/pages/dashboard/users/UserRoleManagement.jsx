import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiShield,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";
import { userAPI, roleAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/pages/dashboard/users/UserRoleManagement.css";

const UserRoleManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'roles'
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "users") {
        const data = await userAPI.getAllUsers();
        setItems(data);
      } else {
        const data = await roleAPI.getAllRoles();
        setItems(data);
      }
      setError(null);
    } catch (err) {
      setError(`Failed to fetch ${activeTab}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${activeTab.slice(0, -1)}?`
      )
    ) {
      try {
        if (activeTab === "users") {
          await userAPI.deleteUser(id);
        } else {
          await roleAPI.deleteRole(id);
        }
        await fetchData();
      } catch (err) {
        setError(`Failed to delete ${activeTab.slice(0, -1)}`);
        console.error(err);
      }
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedItem(null);
    setShowModal(false);
  };

  const handleItemUpdated = async () => {
    await fetchData();
    handleModalClose();
  };

  const getColumns = () => {
    if (activeTab === "users") {
      return [
        { key: "username", label: "Username", sortable: true },
        { key: "email", label: "Email", sortable: true },
        { key: "role_name", label: "Role", sortable: true },
        { key: "status", label: "Status", sortable: true },
        {
          key: "actions",
          label: "Actions",
          render: (_, user) => (
            <div className="management-actions">
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
    } else {
      return [
        { key: "role_name", label: "Role Name", sortable: true },
        { key: "description", label: "Description", sortable: true },
        {
          key: "actions",
          label: "Actions",
          render: (_, role) => (
            <div className="management-actions">
              <ActionButton
                onClick={() => handleEdit(role)}
                variant="secondary"
                size="small"
              >
                <FiEdit2 />
              </ActionButton>
              <ActionButton
                onClick={() => handleDelete(role.role_id)}
                variant="danger"
                size="small"
              >
                <FiTrash2 />
              </ActionButton>
            </div>
          ),
        },
      ];
    }
  };

  return (
    <div className="user-role-management">
      <div className="management-header">
        <div className="management-tabs">
          <Button
            variant={activeTab === "users" ? "contained" : "outlined"}
            onClick={() => setActiveTab("users")}
            icon={<FiUsers />}
          >
            Users
          </Button>
          <Button
            variant={activeTab === "roles" ? "contained" : "outlined"}
            onClick={() => setActiveTab("roles")}
            icon={<FiShield />}
          >
            Roles
          </Button>
        </div>
        <Button
          variant="contained"
          onClick={() => setShowModal(true)}
          icon={<FiPlus />}
        >
          Add {activeTab.slice(0, -1)}
        </Button>
      </div>

      {error && (
        <div className="management-error">
          <FiAlertCircle className="inline mr-2" /> {error}
        </div>
      )}

      {loading ? (
        <Loader size="large" color="primary" />
      ) : (
        <TableWithControl
          data={items}
          columns={getColumns()}
          defaultPageSize={10}
        />
      )}

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={`${selectedItem ? "Edit" : "Add"} ${activeTab.slice(0, -1)}`}
      >
        {activeTab === "users" ? (
          <UserForm
            user={selectedItem}
            onClose={handleModalClose}
            onUserUpdated={handleItemUpdated}
          />
        ) : (
          <RoleForm
            role={selectedItem}
            onClose={handleModalClose}
            onRoleUpdated={handleItemUpdated}
          />
        )}
      </Modal>
    </div>
  );
};

export default UserRoleManagement;
