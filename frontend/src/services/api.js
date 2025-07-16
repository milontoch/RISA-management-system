// API Service for Laravel Backend
import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.api.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Error event subscribers
const errorSubscribers = [];
export function subscribeToApiErrors(fn) {
  errorSubscribers.push(fn);
}
function notifyErrorSubscribers(error) {
  errorSubscribers.forEach(fn => fn(error));
}

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (window.handleSessionExpiry) window.handleSessionExpiry();
    }
    let message = 'Something went wrong. Please try again later.';
    let code = error.response?.status;
    let validation = null;
    if (!error.response) {
      // Network error
      message = 'You are offline.';
      code = 'network';
    } else if (code === 401 || code === 403) {
      message = 'Session expired. Please log in again.';
      // Clear auth and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (code === 422) {
      message = error.response.data.message || 'Validation error.';
      validation = error.response.data.errors || null;
    } else if (code >= 500) {
      message = 'Something went wrong. Please try again later.';
    }
    notifyErrorSubscribers({ code, message, validation, error });
    return Promise.reject({ code, message, validation, error });
  }
);

export default api; 