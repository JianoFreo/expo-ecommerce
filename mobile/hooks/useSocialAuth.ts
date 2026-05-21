import { useAuth, useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useRole } from "@/context/RoleContext";
import axiosInstance from "@/lib/axios";

function useSocialAuth() {
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { isSignedIn, signOut } = useAuth();
  const { startSSOFlow } = useSSO();
  const { selectedRole } = useRole();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setLoadingStrategy(strategy);

    try {
      if (isSignedIn) {
        await signOut();
      }

      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        const profileRes = await axiosInstance.get("/user/profile");
        const profileUser = profileRes.data?.user;
        const profileRole = profileUser?.role;
        const signedInEmail = (profileUser?.email || "").toLowerCase();
        const superAdminEmail = (process.env.EXPO_PUBLIC_ADMIN_EMAIL || "magtangob65@gmail.com").toLowerCase();

        if (signedInEmail === superAdminEmail || profileRole === "super-admin") {
          router.replace("/(super-admin)");
          return;
        }

        if (selectedRole === "seller") {
          // Promote first so seller endpoints allow access and return real data.
          await axiosInstance.post("/user/promote-to-seller");
          router.replace("/(seller)");
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (error) {
      console.log("💥 Error in social auth:", error);
      const provider = strategy === "oauth_google" ? "Google" : "Apple";
      Alert.alert("Error", `Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoadingStrategy(null);
    }
  };

  return { loadingStrategy, handleSocialAuth };
}

export default useSocialAuth;
