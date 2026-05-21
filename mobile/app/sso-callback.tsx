import React from "react";
import { ActivityIndicator, View, Text } from "react-native";
import SafeScreen from "@/components/SafeScreen";

export default function SsoCallbackScreen() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-text-secondary text-base text-center">
          Completing sign in...
        </Text>
      </View>
    </SafeScreen>
  );
}
