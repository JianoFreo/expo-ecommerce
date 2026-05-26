import axios from "axios";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://expo-ecommerce-5lbs.onrender.com/api";

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
