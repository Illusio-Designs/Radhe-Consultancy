import React, { useState, useEffect } from 'react';
import { roleAPI } from '../../services/api'; // Adjust the import based on your API service structure

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await roleAPI.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const newRole = { role_name: roleName, description };
      await roleAPI.createRole(newRole);
      fetchRoles(); // Refresh the roles list
      setRoleName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  return (
    <div>
      <h1>Role Management</h1>
      <form onSubmit={handleCreateRole}>
        <input
          type="text"
          placeholder="Role Name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Create Role</button>
      </form>
      <h2>Existing Roles</h2>
      <ul>
        {roles.map((role) => (
          <li key={role.role_id}>{role.role_name} - {role.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default RoleManagement;
