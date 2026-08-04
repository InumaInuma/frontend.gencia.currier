import axios from 'axios';

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Si estamos en Vercel o en cualquier dominio de producción que no sea localhost
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://almaintic-001-site1.ctempurl.com';
  }
  return 'http://localhost:5254';
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Agrega cabecera X-Requested-With y Token Bearer si existe en localStorage
apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    // Buscar en ambas claves de almacenamiento para compatibilidad total
    const savedUserStr = localStorage.getItem('auth_user') || localStorage.getItem('dreamdrivers_user');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser?.token) {
          config.headers['Authorization'] = `Bearer ${savedUser.token}`;
        }
      } catch (e) {
        // Ignorar si hay error de parseo JSON
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Manejo de Expiración de Sesión (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('dreamdrivers_user');
      // Evitar bucles de parpadeo (flicker loops) en PWA de Samsung Internet
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/' &&
        !window.location.pathname.includes('/login')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
