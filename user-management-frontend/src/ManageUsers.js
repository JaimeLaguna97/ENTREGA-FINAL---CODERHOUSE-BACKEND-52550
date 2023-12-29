import React, { useState, useEffect } from "react";
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("api/user/role/:id");
      setUsers(response.data);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  };

  const handleRoleChange = async () => {
    try {
      await axios.put(`api/user/${selectedUserId}/role`, { role: selectedUserRole });
      fetchUsers();
    } catch (error) {
      console.log("Error updating user role:", error);
    }
  };

  return (
    <div>
      <h2>Manage User Roles</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.firstname} {user.lastname} - {user.role}
          </li>
        ))}
      </ul>
      <div>
        <label>Select User:</label>
        <select onChange={(e) => setSelectedUserId(e.target.value)}>
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.firstname} {user.lastname}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Select Role:</label>
        <select onChange={(e) => setSelectedUserRole(e.target.value)}>
          <option value="">Select a role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button onClick={handleRoleChange}>Update Role</button>
    </div>
  );
};

export default ManageUsers;