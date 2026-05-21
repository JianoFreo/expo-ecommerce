import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function RootRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data, isLoading } = useCurrentUser(isSignedIn);

  if (!isLoaded || (isSignedIn && isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)" />;
  }

  if (data?.user?.role === "admin" || data?.user?.role === "seller") {
    return <Redirect href="/(admin)" />;
  }

  return <Redirect href="/(tabs)" />;
}
