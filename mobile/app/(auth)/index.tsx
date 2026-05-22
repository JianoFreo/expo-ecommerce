import useSocialAuth from "@/hooks/useSocialAuth";
import { useRole } from "@/context/RoleContext";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { router } from "expo-router";

const AuthScreen = () => {
  const { loadingStrategy, handleSocialAuth } = useSocialAuth();
  const { selectedRole, setSelectedRole } = useRole();
  const api = useApi();
  const [guestEnabled, setGuestEnabled] = useState<boolean | null>(null);

  // Don't auto-set role here—let user choose auth method or guest

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/settings');
        if (mounted) setGuestEnabled(Boolean(data?.settings?.guestEnabled));
      } catch (err) {
        if (mounted) setGuestEnabled(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (guestEnabled === null) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="px-8 flex-1 justify-center items-center bg-white">
      {/* DEMO IMAGE */}
      <Image
        source={require("../../assets/images/auth-image.png")}
        className="size-96"
        resizeMode="contain"
      />

      <View className="gap-2 mt-3">
        {/* GOOGLE SIGN IN BTN */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-2"
          onPress={() => handleSocialAuth("oauth_google")}
          disabled={loadingStrategy !== null}
          style={{
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            elevation: 2, // this is for android
          }}
        >
          {loadingStrategy === "oauth_google" ? (
            <ActivityIndicator size={"small"} color={"#4285f4"} />
          ) : (
            <View className="flex-row items-center justify-center">
              <Image
                source={require("../../assets/images/google.png")}
                className="size-10 mr-3"
                resizeMode="contain"
              />
              <Text className="text-black font-medium text-base">Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* APPLE SIGN IN BTN */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-3"
          onPress={() => handleSocialAuth("oauth_apple")}
          disabled={loadingStrategy !== null}
          style={{
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            elevation: 2, // this is for android
          }}
        >
          {loadingStrategy === "oauth_apple" ? (
            <ActivityIndicator size={"small"} color={"#4285f4"} />
          ) : (
            <View className="flex-row items-center justify-center">
              <Image
                source={require("../../assets/images/apple.png")}
                className="size-8 mr-3"
                resizeMode="contain"
              />
              <Text className="text-black font-medium text-base">Continue with Apple</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* GUEST CONTINUE BTN (if enabled) */}
        {guestEnabled ? (
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-3 mt-3"
            onPress={() => {
              setSelectedRole('guest');
              router.replace('/(tabs)');
            }}
            disabled={false}
            style={{
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-black font-medium text-base">Continue as Guest</Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text className="text-center text-gray-500 text-xs leading-4 mt-6 px-2">
        By signing up, you agree to our <Text className="text-blue-500">Terms</Text>
        {", "}
        <Text className="text-blue-500">Privacy Policy</Text>
        {", and "}
        <Text className="text-blue-500">Cookie Use</Text>
      </Text>
    </View>
  );
};

export default AuthScreen;
