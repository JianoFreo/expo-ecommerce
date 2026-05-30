import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/clerk-expo";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useApi } from "@/lib/api";
import { useRole } from "@/context/RoleContext";

export type BuyerThemeId = "green" | "blue" | "orange" | "rose";

export type BuyerTheme = {
  id: BuyerThemeId;
  label: string;
  subtitle: string;
  icon: string;
  primary: string;
};

const THEME_STORAGE_KEY = "buyer-theme-cache";

export const BUYER_THEMES: BuyerTheme[] = [
  { id: "green", label: "Green", subtitle: "Classic storefront", icon: "leaf-outline", primary: "#1DB954" },
  { id: "blue", label: "Blue", subtitle: "Cool and clean", icon: "water-outline", primary: "#3B82F6" },
  { id: "orange", label: "Orange", subtitle: "Warm and bold", icon: "sunny-outline", primary: "#F97316" },
  { id: "rose", label: "Rose", subtitle: "Soft and modern", icon: "heart-outline", primary: "#F43F5E" },
];

const DEFAULT_THEME = BUYER_THEMES[0];

const getThemeById = (themeId: string | null | undefined) =>
  BUYER_THEMES.find((theme) => theme.id === themeId) ?? DEFAULT_THEME;

type ThemeContextValue = {
  theme: BuyerTheme;
  themeId: BuyerThemeId;
  themeLoaded: boolean;
  setThemeId: (themeId: BuyerThemeId) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const api = useApi();
  const { isSignedIn } = useAuth();
  const { selectedRole } = useRole();
  const [themeId, setThemeIdState] = useState<BuyerThemeId>(DEFAULT_THEME.id);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const cachedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (mounted && cachedTheme) {
          setThemeIdState(getThemeById(cachedTheme).id);
        }
      } catch (error) {
        console.warn("Failed to load cached buyer theme", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!isSignedIn || selectedRole === "guest") {
      setThemeIdState(DEFAULT_THEME.id);
      setThemeLoaded(true);
      return;
    }

    (async () => {
      try {
        const response = await api.get("/user/profile");
        const serverThemeId = getThemeById(response.data?.user?.preferredTheme).id;

        if (!mounted) return;

        setThemeIdState(serverThemeId);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, serverThemeId);
      } catch (error) {
        console.warn("Failed to load buyer theme from profile", error);
      } finally {
        if (mounted) setThemeLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [api, isSignedIn, selectedRole]);

  const setThemeId = async (nextThemeId: BuyerThemeId) => {
    const resolvedThemeId = getThemeById(nextThemeId).id;
    setThemeIdState(resolvedThemeId);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, resolvedThemeId);
    } catch (error) {
      console.warn("Failed to cache buyer theme", error);
    }

    if (!isSignedIn || selectedRole === "guest") {
      return;
    }

    try {
      await api.patch("/user/profile", { preferredTheme: resolvedThemeId });
    } catch (error) {
      console.warn("Failed to persist buyer theme", error);
    }
  };

  const value = useMemo(
    () => ({
      theme: getThemeById(themeId),
      themeId,
      themeLoaded,
      setThemeId,
    }),
    [setThemeId, themeId, themeLoaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useBuyerTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useBuyerTheme must be used within ThemeProvider");
  }
  return context;
}
