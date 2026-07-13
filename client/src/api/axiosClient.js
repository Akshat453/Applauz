import axios from 'axios';
import toast from 'react-hot-toast';

let accessTokenGetter = () => null;

export function setAccessTokenGetter(getter) {
  accessTokenGetter = getter;
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = accessTokenGetter();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.response?.data?.error;

    if (status === 401 && window.location.pathname !== '/login') {
      setAccessTokenGetter(() => null);
      window.location.replace('/login');
    }

    if ([400, 403, 404].includes(status) && message) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
