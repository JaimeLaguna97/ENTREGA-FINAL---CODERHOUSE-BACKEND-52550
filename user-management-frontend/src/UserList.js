import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('role/:id:', process.env.REACT_APP_API_BASE_URL);
  
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user/role/:id`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);
  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.firstname} {user.lastname} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;