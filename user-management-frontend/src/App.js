import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Home from './Home';
import UserList from './UserList';

function App() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/users">User List</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/users" element={<UserList />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;