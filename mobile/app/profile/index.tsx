import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useApi } from "@/lib/api";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

export default function EditProfile() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const api = useApi();

  const [name, setName] = useState(user?.fullName || user?.firstName || user?.username || "");
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.patch(`/users/profile`, { name, imageUrl });
      Alert.alert("Success", "Profile updated");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      <View className="p-6">
        <Text className="text-lg font-bold mb-4">Edit Profile</Text>

        <Text className="text-sm text-text-secondary mb-1">Full name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          className="bg-surface rounded-lg px-4 py-3 mb-4"
        />

        <Text className="text-sm text-text-secondary mb-1">Avatar URL</Text>
        <TextInput
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://..."
          className="bg-surface rounded-lg px-4 py-3 mb-6"
        />

        <Button title={loading ? "Saving..." : "Save"} disabled={loading} onPress={handleSave} />
      </View>
    </SafeScreen>
  );
}
