import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://10.0.2.2:5000/api/v1'; // Android emulator
// const API_BASE = 'http://localhost:5000/api/v1'; // iOS simulator
// const API_BASE = 'http://YOUR_SERVER_IP:5000/api/v1'; // Physical device

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          await AsyncStorage.setItem('token', res.data.data.token);
          await AsyncStorage.setItem('refreshToken', res.data.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await AsyncStorage.clear();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
