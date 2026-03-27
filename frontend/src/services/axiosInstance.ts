import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor — attach JWT ─────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401 ────────────────────────────
// Only redirect to login if:
//   1. The request was NOT a public endpoint (login / forgot / reset)
//   2. We actually have a token stored (i.e. user was logged in)
// This prevents the bulk-upload response being misread as a session error.
const PUBLIC_PATHS = ['/api/v1/auth/login', '/api/v1/auth/forgot-password', '/api/v1/auth/reset-password'];

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const url     = error.config?.url ?? '';
    const isPublic = PUBLIC_PATHS.some((p) => url.includes(p));
    const hasToken = !!localStorage.getItem('access_token');

    if (status === 401 && !isPublic && hasToken) {
      // Small delay so any in-flight state updates finish before redirect
      setTimeout(() => {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }, 300);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
