import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends httpOnly cookie automatically
});

// Handle 401 globally — redirect to login, but skip auth endpoints to avoid loops
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const is401 = err.response?.status === 401;
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/me');
    const isAlreadyOnLogin = window.location.pathname === '/login';

    if (is401 && !isAuthEndpoint && !isAlreadyOnLogin) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
