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
      if (res.data?.data) {
        setUser(res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      }
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

  const requestLoginOtp = async (email, password = '') => {
    try {
      const payload = { email: email.trim().toLowerCase() };
      if (password) payload.password = password;
      const res = await api.post('/auth/login-send-otp', payload);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
      throw error;
    }
  };

  const verifyLoginOtp = async (email, code) => {
    try {
      const res = await api.post('/auth/login-verify-otp', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      const { token: newToken, refreshToken } = res.data.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(newToken);
      setUser(res.data.data.user);
      toast.success('Welcome back!');
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired verification code');
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      const { token: newToken, refreshToken, user: newUser } = res.data.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(newUser);
      setToken(newToken);
      toast.success('Account created successfully!');
      return res.data.data;
    } catch (error) {
      console.error('[Auth Registration Error]:', error);
      let msg = error.response?.data?.message || error.response?.data?.errors?.[0]?.message;
      if (!msg) {
        if (error.message === 'Network Error') {
          msg = 'Unable to reach backend server. Please verify your connection or refresh the page.';
        } else {
          msg = error.message || 'Registration failed. Please check your credentials.';
        }
      }
      toast.error(msg, { duration: 6000 });
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
    <AuthContext.Provider value={{ user, token, loading, login, requestLoginOtp, verifyLoginOtp, register, logout, updateProfile, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
