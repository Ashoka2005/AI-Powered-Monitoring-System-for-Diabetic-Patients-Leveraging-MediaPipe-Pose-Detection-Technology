import axios from 'axios';

export const DEFAULT_HOST_IP = '10.189.225.89';

export const getServerIp = () => {
  return localStorage.getItem('diafit_server_ip') || DEFAULT_HOST_IP;
};

export const setServerIp = (ip) => {
  if (ip && ip.trim()) {
    localStorage.setItem('diafit_server_ip', ip.trim());
  } else {
    localStorage.removeItem('diafit_server_ip');
  }
  window.location.reload();
};

export const getServerBase = () => {
  if (typeof window === 'undefined') return '/api/v1';

  // 1. Cloud / Vercel Web Deployment (Always use relative /api/v1 on public domains to avoid Mixed Content / CORS errors)
  const isCloudHost = window.location.hostname && (
    window.location.hostname.endsWith('.vercel.app') || 
    window.location.hostname.includes('.render.com') || 
    window.location.hostname.includes('.railway.app') ||
    (window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'))
  );

  if (isCloudHost) {
    if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('https://')) {
      return import.meta.env.VITE_API_URL;
    }
    return '/api/v1';
  }

  // 2. Explicit Environment Variable
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('http')) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 3. Custom Server IP saved in localStorage (for mobile LAN testing only)
  const customIp = localStorage.getItem('diafit_server_ip');
  if (customIp && customIp.trim() && window.location.protocol !== 'https:') {
    return `http://${customIp.trim()}:5000/api/v1`;
  }

  // 4. Native Android APK / Capacitor / File URL environment:
  const isNativeApp = window.Capacitor !== undefined || 
    window.location.protocol === 'file:' ||
    (window.location.hostname === 'localhost' && window.location.protocol === 'https:' && !window.location.port);
    
  if (isNativeApp) {
    return `http://${DEFAULT_HOST_IP}:5000/api/v1`;
  }

  // 5. Local LAN IP access (e.g. 192.168.x.x or 10.x.x.x)
  if (window.location.hostname && (
    window.location.hostname.startsWith('192.168.') || 
    window.location.hostname.startsWith('10.') || 
    window.location.hostname.startsWith('172.')
  )) {
    return `${window.location.protocol}//${window.location.hostname}:5000/api/v1`;
  }

  // 6. Desktop localhost browser (vite dev proxy forwards /api to localhost:5000)
  return import.meta.env.VITE_API_URL || '/api/v1';
};

const API_BASE = getServerBase();
console.log("DiaFit AI API Base URL:", API_BASE);
console.log("DiaFit AI API Base URL:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('refreshToken', res.data.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
