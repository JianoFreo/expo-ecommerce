import SafeScreen from "@/components/SafeScreen";
import { Text, View } from "react-native";

export default function PrivacySecurity() {
  return (
    <SafeScreen>
      <View className="p-6">
        <Text className="text-lg font-bold mb-4">Privacy & Security</Text>
        <Text className="text-text-secondary">This page contains privacy settings and links. Placeholder for now.</Text>
      </View>
    </SafeScreen>
  );
}
