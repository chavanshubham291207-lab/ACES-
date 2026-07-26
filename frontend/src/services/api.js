import axios from 'axios';

// Environment-based API URL configuration
// Development: VITE_API_URL=http://localhost:5000
// Production:  VITE_API_URL=https://your-backend-domain.com
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aces_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiry & 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear stored credentials if token is invalid or expired
      const token = localStorage.getItem('aces_token');
      if (token) {
        localStorage.removeItem('aces_token');
        localStorage.removeItem('aces_user');
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
