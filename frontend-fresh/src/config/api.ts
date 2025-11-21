import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  leetcode: {
    getStats: (username: string) => 
      axios.post(`${API_BASE_URL}/api/leetcode/stats`, { username })
  },
  gfg: {
    getStats: (username: string) => 
      axios.post(`${API_BASE_URL}/api/gfg/stats`, { username })
  },
  hackerrank: {
    getStats: (username: string) => 
      axios.post(`${API_BASE_URL}/api/hackerrank/stats`, { username })
  },
  codechef: {
    getStats: (username: string) => 
      axios.post(`${API_BASE_URL}/api/codechef/stats`, { username })
  },
  codeforces: {
    getStats: (username: string) => 
      axios.post(`${API_BASE_URL}/api/codeforces/stats`, { username })
  }
};

export default api;
