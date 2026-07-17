import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://closerai-qcj3.onrender.com'
});

// Request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('closer-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
