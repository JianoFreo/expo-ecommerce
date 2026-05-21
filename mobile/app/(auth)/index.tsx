import { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import useSocialAuth from "@/hooks/useSocialAuth";

const AuthScreen = () => {
  const { loadingStrategy, handleSocialAuth } = useSocialAuth();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"user" | "seller">("user");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <View className="px-8 flex-1 justify-center items-center bg-white">
      {/* DEMO IMAGE */}
      <Image
        source={require("../../assets/images/auth-image.png")}
        className="size-96"
        resizeMode="contain"
      />

      <View className="items-center mb-2">
        <Text className="text-2xl font-bold text-black text-center">Choose how you want to sign in</Text>
        <Text className="text-sm text-gray-500 text-center mt-2 px-4">
          User goes to the shop. Seller unlocks the same admin tools you already have on web.
        </Text>
      </View>

      <View className="gap-2 mt-3">
        <View className="flex-row gap-2 mb-4 justify-center">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${mode === "user" ? "bg-black border-black" : "bg-white border-gray-300"}`}
            onPress={() => setMode("user")}
          >
            <Text className={mode === "user" ? "text-white font-semibold" : "text-black font-semibold"}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${mode === "seller" ? "bg-black border-black" : "bg-white border-gray-300"}`}
            onPress={() => setMode("seller")}
          >
            <Text className={mode === "seller" ? "text-white font-semibold" : "text-black font-semibold"}>Seller</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-sm text-gray-600 mb-2">
          Signing in as <Text className="font-semibold text-black">{mode === "seller" ? "Seller" : "User"}</Text>
          {mode === "seller" ? " will create seller access if you don't already have it." : " will keep you in the customer app."}
        </Text>

        {/* GOOGLE SIGN IN BTN */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-2"
          onPress={() => handleSocialAuth("oauth_google", mode)}
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
              <Text className="text-black font-medium text-base">Continue as {mode === "seller" ? "Seller" : "User"} with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* APPLE SIGN IN BTN */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white border border-gray-300 rounded-full px-6 py-3"
          onPress={() => handleSocialAuth("oauth_apple", mode)}
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
              <Text className="text-black font-medium text-base">Continue as {mode === "seller" ? "Seller" : "User"} with Apple</Text>
            </View>
          )}
        </TouchableOpacity>
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
