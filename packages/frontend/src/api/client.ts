import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// For demo purposes, we use a hardcoded Bearer token if not provided.
// The backend auth stub derives a stable user id from it (see auth-middleware.ts).
// In a real app, this would come from an auth context.
api.interceptors.request.use((config) => {
  if (!config.headers['Authorization']) {
    config.headers['Authorization'] = 'Bearer demo-token-123';
  }
  return config;
});

export default api;
