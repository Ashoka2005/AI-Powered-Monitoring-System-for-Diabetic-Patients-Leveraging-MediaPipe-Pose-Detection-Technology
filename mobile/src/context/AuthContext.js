import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Load auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
    if (data.data?.token) {
      await AsyncStorage.setItem('token', data.data.token);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
    }
    return data;
  };

  const requestLoginOtp = async (email, password) => {
    const { data } = await api.post('/auth/login-send-otp', {
      email: (email || '').trim().toLowerCase(),
      password,
    });
    return data;
  };

  const verifyLoginOtp = async (email, code) => {
    const { data } = await api.post('/auth/login-verify-otp', {
      email: (email || '').trim().toLowerCase(),
      code: (code || '').trim(),
    });
    await AsyncStorage.setItem('token', data.data.token);
    await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  const sendRegisterOtp = async (email) => {
    const { data } = await api.post('/auth/send-otp', {
      email: (email || '').trim().toLowerCase(),
    });
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    await AsyncStorage.setItem('token', data.data.token);
    await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) { /* ignore */ }
    await AsyncStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, requestLoginOtp, verifyLoginOtp, sendRegisterOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
