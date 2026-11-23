import axios from 'axios';

// One shared API client. The token lives in localStorage when "Remember me"
// is ticked, otherwise in sessionStorage (cleared when the tab closes).
// Note: any browser-stored token can be read by injected scripts, so keep
// the app free of XSS and keep token lifetimes short (JWT_EXPIRES_IN).
const KEY = 'plantista_token';
export const tokenStore = {
  get: () => localStorage.getItem(KEY) || sessionStorage.getItem(KEY),
  set: (token, remember) => {
    tokenStore.clear();
    (remember ? localStorage : sessionStorage).setItem(KEY, token);
  },
  clear: () => { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); },
};

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turns any failure into { message, errors } so forms can show it directly.
export const apiError = (err) => ({
  message: err.response?.data?.message || (err.response ? 'Something went wrong. Please try again.' : 'Cannot reach the server. Check your connection and try again.'),
  errors: err.response?.data?.errors || {},
  status: err.response?.status,
});

export default api;
