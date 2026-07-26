import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('aces_token');
      const storedUser = await AsyncStorage.getItem('aces_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify with MongoDB backend
        const res = await API.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          await AsyncStorage.setItem('aces_user', JSON.stringify(res.data.user));
        }
      }
    } catch (err) {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password, loginType: 'member' });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      await AsyncStorage.setItem('aces_token', res.data.token);
      await AsyncStorage.setItem('aces_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('aces_token');
    await AsyncStorage.removeItem('aces_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
