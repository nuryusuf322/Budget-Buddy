import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole && !['admin', 'manager'].includes(user.role)) {
    return <Navigate to="/transactions" replace />;
  }

  return children;
};

export default ProtectedRoute;








