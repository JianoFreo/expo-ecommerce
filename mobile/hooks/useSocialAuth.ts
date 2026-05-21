import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import { useApi } from "@/lib/api";
import * as Linking from "expo-linking";

function useSocialAuth() {
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();
  const api = useApi();

  const handleSocialAuth = async (
    strategy: "oauth_google" | "oauth_apple",
    role: "user" | "seller" = "user"
  ) => {
    setLoadingStrategy(strategy);

    try {
      // Use the standard sso-callback route for both Expo Go and standalone builds.
      const redirectUrl = process.env.EXPO_PUBLIC_CLERK_REDIRECT_URL || Linking.createURL("sso-callback");

      const { createdSessionId, setActive } = await startSSOFlow({ strategy, redirectUrl });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        if (role === "seller") {
          await api.post("/users/become-seller");
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
