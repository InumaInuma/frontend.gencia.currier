import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://almaintic-001-site1.ctempurl.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
