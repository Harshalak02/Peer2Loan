// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api'; // Make sure authService has login, register, verifyToken
import webSocketService from '../services/websocket';

// 1. Create Context
const AuthContext = createContext();

// 2. Custom Hook to access AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 3. AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await authService.verifyToken();
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          // Connect to WebSocket when user is authenticated
          webSocketService.connect();
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.data.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        // Connect to WebSocket on successful login
        webSocketService.connect();
        return { success: true, user: res.data.user };
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      if (res.data.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Disconnect WebSocket on logout
    webSocketService.disconnect();
  };

  // Context value
  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
