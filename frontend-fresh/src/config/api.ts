import axios from 'axios';

// Use the VITE_API_URL environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a custom axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Log the base URL for debugging
console.log('API Base URL:', API_BASE_URL);

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const apiEndpoints = {
  leetcode: {
    getStats: (username: string) => 
      api.post('/api/leetcode/stats', { username })
  },
  gfg: {
    getStats: (username: string) => 
      api.post('/api/gfg/stats', { username })
  },
  hackerrank: {
    getStats: (username: string) => 
      api.post('/api/hackerrank/stats', { username })
  },
  codechef: {
    getStats: (username: string) => 
      api.post('/api/codechef/stats', { username })
  },
  codeforces: {
    getStats: (username: string) => 
      api.post('/api/codeforces/stats', { username })
  }
};

export default apiEndpoints;
