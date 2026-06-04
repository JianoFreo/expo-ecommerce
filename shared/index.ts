import axios from "axios";

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_URL || "https://expo-ecommerce-5lbs.onrender.com/api";

// Keep base URL as provided. Mobile-specific host-mapping is handled in the mobile app.
export const API_BASE_URL = rawApiBaseUrl;

export const axiosInstance = axios.create({
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

export * from "./types";
export default axiosInstance;
