import SafeScreen from "@/components/SafeScreen";
import { Text, View } from "react-native";

export default function Notifications() {
  return (
    <SafeScreen>
      <View className="p-6">
        <Text className="text-lg font-bold mb-4">Notifications</Text>
        <Text className="text-text-secondary">Notification preferences will appear here. For now this is a placeholder.</Text>
      </View>
    </SafeScreen>
  );
}
