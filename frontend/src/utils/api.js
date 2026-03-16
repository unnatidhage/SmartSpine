import axios from 'axios';

const API = axios.create({ baseURL: 'https://smartspine-backend.onrender.com/api' });

// Attach JWT automatically
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default API;
