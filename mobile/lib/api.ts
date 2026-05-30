import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { useEffect } from "react";
import { Platform } from "react-native";

const rawApiUrl =
  process.env.EXPO_PUBLIC_API_URL || "https://expo-ecommerce-5lbs.onrender.com/api";

const API_URL = rawApiUrl.replace(
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/,
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000"
);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useApi = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      const token = await getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    // cleanup: remove interceptor when component unmounts

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  return api;
};

// on every single req, we would like have an auth token so that our backend knows that we're authenticated
// we're including the auth token under the auth headers
