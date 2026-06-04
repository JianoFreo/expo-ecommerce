import axios from "axios";
import { Platform } from "react-native";

const rawApiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL || "https://expo-ecommerce-5lbs.onrender.com/api";

export const API_BASE_URL = rawApiBaseUrl.replace(
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/,
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000"
);

if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not set");
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let tokenGetter: null | (() => Promise<string | null>) = null;

export function setAxiosTokenGetter(
  getter: null | (() => Promise<string | null>),
) {
  tokenGetter = getter;
}

// Request interceptor to add Clerk token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = tokenGetter ? await tokenGetter() : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could trigger logout
      console.error("Unauthorized access");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
