import axios from "axios";

const rawApiBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000/api";

export const API_BASE_URL = rawApiBaseUrl;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let tokenGetter: null | (() => Promise<string | null>) = null;

export function setTokenGetter(getter: null | (() => Promise<string | null>)) {
  tokenGetter = getter;
}

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = tokenGetter ? await tokenGetter() : null;
      if (token) {
        // @ts-ignore
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // swallow
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
