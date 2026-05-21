// src/services/api.js
// Axios instance with JWT interceptors and error handling

import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: Attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Pull token directly from localStorage (avoids circular import with store)
    try {
      const storage = JSON.parse(localStorage.getItem('bgv-auth-storage') || '{}');
      const token = storage?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('bgv-auth-storage');
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Candidate API ────────────────────────────────────────────────────────────
export const candidateAPI = {
  getAll: (params) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
  getStats: () => api.get('/candidates/stats'),
};

// ─── Verification API ─────────────────────────────────────────────────────────
export const verificationAPI = {
  start: (candidateId) => api.post(`/verifications/${candidateId}/start`),
  getLogs: (candidateId) => api.get(`/verifications/${candidateId}/logs`),
};

// ─── Report API ───────────────────────────────────────────────────────────────
export const reportAPI = {
  download: async (candidateId, candidateName) => {
    const response = await api.get(`/reports/${candidateId}`, {
      responseType: 'blob',
    });
    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BGV_Report_${candidateName}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default api;
