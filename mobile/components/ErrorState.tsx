import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBuyerTheme } from "@/context/ThemeContext";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please check your connection and try again",
  onRetry,
}: ErrorStateProps) {
  const { theme } = useBuyerTheme();

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
      <Text className="text-text-primary font-semibold text-xl mt-4">{title}</Text>
      <Text className="text-text-secondary text-center mt-2">{description}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} className="mt-4 px-6 py-3 rounded-xl" style={{ backgroundColor: theme.primary }}>
          <Text className="text-background font-semibold">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
