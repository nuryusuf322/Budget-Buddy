import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState(null);

  useEffect(() => {
    // Check if user and token are stored in localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        // Store email for OTP verification
        setPendingEmail(response.data.email || email);
        return { success: true, email: response.data.email || email };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await authAPI.verifyOTP({ email, otp });
      if (response.data.success) {
        const userData = response.data.data;
        const token = response.data.token;
        
        // Store user and token
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setPendingEmail(null);
        
        return { success: true, data: userData };
      }
      return { success: false, message: response.data.message || 'OTP verification failed' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'OTP verification failed. Please try again.';
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.data.success) {
        const newUser = response.data.data;
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return { success: true, data: newUser };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      // Handle validation errors from express-validator
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const firstError = error.response.data.errors[0];
        const errorMessage = firstError.msg || firstError.message || 'Validation error';
        return { success: false, message: errorMessage };
      }
      
      // Handle other error messages
      const errorMessage = error.response?.data?.message || 
                          error.message ||
                          'Registration failed. Please try again.';
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setPendingEmail(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      verifyOTP,
      logout, 
      loading,
      pendingEmail,
      setPendingEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

