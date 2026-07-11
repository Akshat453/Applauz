import axios from "axios";

let accessTokenGetter = () => null;

export function setAccessTokenGetter(getter) {
  accessTokenGetter = getter;
}

const axiosClient = axios.create({
  baseURL: "/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = accessTokenGetter();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;
