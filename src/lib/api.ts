// src/lib/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // ❌ REMOVIDO /auth para evitar erro 404
});

// Interceptador para anexar token JWT se existir
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const idorganizacao = localStorage.getItem('idorganizacao');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (idorganizacao && config.headers) {
      config.headers["x-organization-id"] = idorganizacao;
    }
  }
  return config;
});

export default api;



