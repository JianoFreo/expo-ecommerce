import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useApi } from "@/lib/api";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

export default function EditProfile() {
  const { user } = useUser();
  const api = useApi();

  const [name, setName] = useState(user?.fullName || user?.firstName || user?.username || "");
  const [imageUri, setImageUri] = useState(user?.imageUrl || "");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo library access to choose an avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setSelectedAvatar(result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let uploadedImageUrl = user?.imageUrl || "";

      if (selectedAvatar) {
        const formData = new FormData();
        formData.append("avatar", {
          uri: selectedAvatar,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any);

        const uploadResponse = await api.post("/user/profile/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        uploadedImageUrl = uploadResponse.data?.imageUrl || uploadedImageUrl;
      }

      await api.patch(`/user/profile`, {
        name,
        imageUrl: uploadedImageUrl,
      });

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
      <View className="p-6 flex-1">
        <Text className="text-lg font-bold mb-4">Edit Profile</Text>

        <View className="items-center mb-6">
          <Image
            source={imageUri || user?.imageUrl}
            style={{ width: 96, height: 96, borderRadius: 48 }}
            contentFit="cover"
          />
          <Pressable onPress={pickAvatar} className="mt-4 bg-primary px-4 py-3 rounded-full">
            <Text className="text-background font-bold">Choose Avatar</Text>
          </Pressable>
          <Text className="text-text-secondary text-xs mt-2">Select a square image for best results</Text>
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
