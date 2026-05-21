import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useRole } from "@/context/RoleContext";
import axiosInstance from "@/lib/axios";

function useSocialAuth() {
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();
  const { selectedRole } = useRole();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setLoadingStrategy(strategy);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        // After successful sign-in
        // Get current user profile
        console.log("🔍 Fetching profile from:", axiosInstance.defaults.baseURL + "/user/profile");
        const profileRes = await axiosInstance.get("/user/profile");
        console.log("✅ Profile response:", profileRes.data);
        const { user, shop } = profileRes.data;

        // If user chose seller role, promote to seller
        if (selectedRole === "seller" && user.role !== "seller" && user.role !== "super-admin") {
          try {
            await axiosInstance.post("/user/promote-to-seller");
          } catch (err) {
            console.log("Seller promotion error (non-blocking):", err);
          }
        }

        // Check user's role and route accordingly
        const userRole = user.role;
        if (userRole === "super-admin") {
          router.replace("/(super-admin)");
        } else if (userRole === "seller") {
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
