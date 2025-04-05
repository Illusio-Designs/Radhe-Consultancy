import React, { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import UserModal from './UserModal'; // Import the modal component

function UserList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // For editing user

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await userAPI.getAllUsers();
        setUsers(userList);
      } catch (err) {
        setError('Failed to fetch users');
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await userAPI.deleteUser(userId);
      setUsers(users.filter(user => user.user_id !== userId)); // Update the user list
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const openModal = (user = null) => {
    setCurrentUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setCurrentUser(null);
    setModalOpen(false);
  };

  return (
    <div>
      <h2>User List</h2>
      {error && <p className="error">{error}</p>}
      <button onClick={() => openModal()}>Add User</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.user_id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role_id === 1 ? 'Admin' : 'User'}</td>
              <td>
                <button onClick={() => openModal(user)}>Edit</button>
                <button onClick={() => handleDelete(user.user_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalOpen && (
        <UserModal
          user={currentUser}
          onClose={closeModal}
          onUserUpdated={(updatedUser) => {
            if (currentUser) {
              setUsers(users.map(user => (user.user_id === updatedUser.user_id ? updatedUser : user)));
            } else {
              setUsers([...users, updatedUser]);
            }
            closeModal();
          }}
        />
      )}
    </div>
  );
}

export default UserList; 