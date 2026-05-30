import SafeScreen from "@/components/SafeScreen";
import { useBuyerTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const SETTINGS_THEMES = [
  { id: "green", label: "Green", subtitle: "Classic storefront", icon: "leaf-outline" },
  { id: "blue", label: "Blue", subtitle: "Cool and clean", icon: "water-outline" },
  { id: "orange", label: "Orange", subtitle: "Warm and bold", icon: "sunny-outline" },
  { id: "rose", label: "Rose", subtitle: "Soft and modern", icon: "heart-outline" },
] as const;

export default function SettingsScreen() {
  const { theme, themeId, setThemeId } = useBuyerTheme();

  return (
    <SafeScreen>
      <View className="px-6 pb-4 border-b border-surface flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">Settings</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="px-6 pt-6">
          <Text className="text-text-primary text-lg font-bold mb-4">Theme</Text>

          <View className="bg-surface rounded-3xl p-4">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-text-primary text-xl font-bold">Buyer appearance</Text>
                <Text className="text-text-secondary text-sm mt-1">Choose the accent color for the whole app.</Text>
              </View>
              <View className="items-end">
                <View className="rounded-full w-3 h-3 mb-2" style={{ backgroundColor: theme.primary }} />
                <Text className="text-text-secondary text-xs uppercase tracking-wide">{theme.label}</Text>
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {SETTINGS_THEMES.map((option) => {
                const isSelected = option.id === themeId;

                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setThemeId(option.id)}
                    activeOpacity={0.85}
                    className="w-[48%] rounded-2xl p-4 mb-3 border"
                    style={{
                      backgroundColor: isSelected ? `${theme.primary}18` : "#181818",
                      borderColor: isSelected ? theme.primary : "#3E3E3E",
                    }}
                  >
                    <View className="w-11 h-11 rounded-full items-center justify-center mb-3" style={{ backgroundColor: `${theme.primary}20` }}>
                      <Ionicons name={option.icon} size={22} color={theme.primary} />
                    </View>
                    <Text className="text-text-primary font-semibold text-base">{option.label}</Text>
                    <Text className="text-text-secondary text-xs mt-1">{option.subtitle}</Text>
                    {isSelected ? (
                      <View className="mt-3 flex-row items-center">
                        <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                        <Text className="text-text-primary text-xs ml-1 font-semibold">Selected</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View className="px-6 pt-4">
          <Text className="text-text-primary text-lg font-bold mb-4">Security</Text>

          <TouchableOpacity
            className="bg-surface rounded-2xl p-4 flex-row items-center justify-between"
            activeOpacity={0.7}
            onPress={() => router.push("/privacy-security")}
          >
            <View className="flex-row items-center flex-1 pr-3">
              <View className="rounded-full w-12 h-12 items-center justify-center mr-4" style={{ backgroundColor: `${theme.primary}20` }}>
                <Ionicons name="shield-checkmark-outline" size={24} color={theme.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-bold text-base mb-1">Privacy & Security</Text>
                <Text className="text-text-secondary text-sm">Manage permissions, privacy and account protection.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}