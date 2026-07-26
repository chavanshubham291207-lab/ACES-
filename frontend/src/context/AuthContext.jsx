import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('aces_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('aces_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from server on load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('aces_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password, loginType = 'member') => {
    const res = await API.post('/auth/login', { email, password, loginType });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('aces_token', res.data.token);
      localStorage.setItem('aces_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aces_token');
    localStorage.removeItem('aces_user');
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('aces_user', JSON.stringify(updatedUser));
  };

  const ADMIN_ROLES = [
    'Super Admin',
    'President',
    'Vice President',
    'Secretary',
    'Treasurer',
    'Team Lead',
    'Faculty Coordinator'
  ];

  const isAdmin = user && ADMIN_ROLES.includes(user.role);
  const isSuperAdmin = user && user.role === 'Super Admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUserProfile, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
