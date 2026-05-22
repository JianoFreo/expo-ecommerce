import SafeScreen from "@/components/SafeScreen";
import { useUser } from "@clerk/clerk-expo";
import { useApi } from "@/lib/api";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

export default function EditProfile() {
  const { user } = useUser();
  const api = useApi();

  const [name, setName] = useState(user?.fullName || user?.firstName || user?.username || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      await api.patch(`/user/profile`, {
        name,
      });

      Alert.alert("Success", "Profile updated");
      router.back();
    } catch (err: any) {
      console.error("Profile update error:", err?.response?.data || err?.message);
      Alert.alert("Error", err?.response?.data?.error || "Unable to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      <View className="p-6 flex-1">
        <Text className="text-lg font-bold mb-4">Edit Profile</Text>

        <View className="items-center mb-6">
          <Image
            source={user?.imageUrl}
            style={{ width: 96, height: 96, borderRadius: 48 }}
            contentFit="cover"
          />
          <Text className="text-text-secondary text-xs mt-3">Avatar changes are disabled</Text>
        </View>

        <Text className="text-sm text-text-secondary mb-1">Full name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          className="bg-surface rounded-lg px-4 py-3 mb-4"
        />

        <Pressable
          onPress={handleSave}
          disabled={loading}
          className={`rounded-xl py-4 items-center ${loading ? "bg-surface" : "bg-primary"}`}
        >
          <Text className={`font-bold ${loading ? "text-text-secondary" : "text-background"}`}>
            {loading ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}
