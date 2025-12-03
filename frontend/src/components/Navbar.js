import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          💰 Budget Buddy
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/transactions">Transactions</Link>
              <Link to="/budgets">Budgets</Link>
              <Link to="/categories">Categories</Link>
              {(user.role === 'admin' || user.role === 'manager') && (
                <Link to="/users">Users</Link>
              )}
              <span className="navbar-user">
                Welcome, {user.username}! 
                {user.role && user.role !== 'user' && (
                  <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.8 }}>
                    ({user.role})
                  </span>
                )}
              </span>
              <button className="btn btn-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;








