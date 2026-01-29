// src/services/api.js - COMPLETE UPDATED VERSION
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      alert('Access denied. You need proper permissions.');
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  validateToken: () => api.get('/auth/validate-token'),
};

// ==================== ESTIMATE API ====================
export const estimateAPI = {
  // Calculation
  calculate: (formData) => api.post('/estimate/calculate', formData),
  
  // History & Details - UPDATED TO MATCH YOUR BACKEND
  getHistory: (page = 1, per_page = 10) => 
    api.get('/estimate/history', { params: { page, per_page } }),
  getEstimate: (id) => api.get(`/estimate/history/${id}`),
  deleteEstimate: (id) => api.delete(`/estimate/history/${id}`),
  
  // Materials & Cities
  getCities: () => api.get('/estimate/cities'),
  getMaterials: () => api.get('/estimate/materials'),
  
  // Test & Debug
  test: () => api.get('/estimate/test'),
  debug: (data) => api.post('/estimate/debug', data),
};

// ==================== ADMIN API ====================
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getSystemStats: () => api.get('/admin/system/stats'),
  
  // Materials Management
  getAllMaterials: () => api.get('/admin/materials'),
  createMaterial: (data) => api.post('/admin/materials', data),
  updateMaterial: (id, data) => api.put(`/admin/materials/${id}`, data),
  deleteMaterial: (id) => api.delete(`/admin/materials/${id}`),
  
  // Cities Management
  getAllCities: () => api.get('/admin/cities'),
  createCity: (data) => api.post('/admin/cities', data),
  updateCity: (id, data) => api.put(`/admin/cities/${id}`, data),
  deleteCity: (id) => api.delete(`/admin/cities/${id}`),
  
  // Estimates Management
  getAllEstimates: (page = 1, per_page = 20) => 
    api.get('/admin/estimates', { params: { page, per_page } }),
  getEstimateDetails: (id) => api.get(`/admin/estimates/${id}`),
  deleteEstimateAdmin: (id) => api.delete(`/admin/estimates/${id}`),
  
  // Users Management
  getAllUsers: (page = 1, per_page = 20) => 
    api.get('/admin/users', { params: { page, per_page } }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// ==================== UTILITY FUNCTIONS ====================
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'PKR 0';
  return `PKR ${parseFloat(amount).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const downloadJSON = (data, filename) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper function to handle API errors consistently
export const handleApiError = (error, customMessage = 'Something went wrong') => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.error || data.message || 'Bad request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 422:
        return data.error || data.message || 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.error || data.message || customMessage;
    }
  } else if (error.request) {
    // Request was made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Something happened in setting up the request
    return error.message || customMessage;
  }
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

// Helper to get user data from localStorage
export const getUserData = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Helper to set user data in localStorage
export const setUserData = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

// Helper to clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('authChange'));
};

export default api;