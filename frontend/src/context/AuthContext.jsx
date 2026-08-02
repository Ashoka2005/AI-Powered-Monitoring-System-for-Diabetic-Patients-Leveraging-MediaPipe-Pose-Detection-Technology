import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, refreshToken } = res.data.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(newToken);
      setUser(res.data.data.user);
      toast.success('Welcome back!');
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      const { token: newToken, refreshToken } = res.data.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(newToken);
      setUser(res.data.data.user);
      toast.success('Account created successfully!');
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/users/me', data);
      setUser(res.data.data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
