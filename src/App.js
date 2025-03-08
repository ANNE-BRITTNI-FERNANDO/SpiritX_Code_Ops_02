import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/user/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('userRole'));

  const handleLogin = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setToken(null);
    setRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={token ? <Navigate to={role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/admin/dashboard/*" 
          element={token && role === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/user/dashboard/*" 
          element={token && role === 'user' ? <UserDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
};

export default App;
