import { useEffect } from "react";
import { useRouter, useSearchParams } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function SsoCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    // After Clerk/SSO redirects here, send the user to root which will fetch /users/me
    // and route them into admin or tabs depending on their role.
    router.replace("/");
  }, [params]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#1DB954" />
    </View>
  );
}
