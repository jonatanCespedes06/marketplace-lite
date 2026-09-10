import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// For demo purposes, we'll use a hardcoded user-id in the headers if not provided
// In a real app, this would come from an auth context
api.interceptors.request.use((config) => {
  if (!config.headers['user-id']) {
    config.headers['user-id'] = 'demo-user-123';
  }
  return config;
});

export default api;
