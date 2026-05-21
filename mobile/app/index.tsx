import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Root() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { data, isLoading } = useCurrentUser(isSignedIn);
  const hasRouted = useRef(false);

  useEffect(() => {
    if (!isLoaded || hasRouted.current) {
      return;
    }

    if (!isSignedIn) {
      hasRouted.current = true;
      router.replace("/(auth)");
      return;
    }

    if (isLoading) {
      return;
    }

    const role = data?.user?.role;
    hasRouted.current = true;
    router.replace(role === "admin" || role === "seller" || role === "superAdmin" ? "/(admin)" : "/(tabs)");
  }, [data?.user?.role, isLoaded, isLoading, isSignedIn, router]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#1DB954" />
    </View>
  );
}
