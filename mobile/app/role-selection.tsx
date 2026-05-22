import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { useRole } from "@/context/RoleContext";
import SafeScreen from "@/components/SafeScreen";
import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";

const RoleSelectionScreen = () => {
  const { setSelectedRole } = useRole();

  const handleRoleSelection = (role: "buyer" | "seller") => {
    setSelectedRole(role);
    router.replace("/(auth)");
  };

  // fetch settings to know if guest browsing is allowed
  const api = useApi();
  const [guestEnabled, setGuestEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/settings');
        if (mounted) setGuestEnabled(Boolean(data?.settings?.guestEnabled));
      } catch (err) {
        console.warn('Failed to fetch settings', err);
        if (mounted) setGuestEnabled(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleGuest = () => {
    if (guestEnabled === false) {
      Alert.alert('Guest browsing is disabled', 'Guest browsing is currently disabled by the administrator. Please sign in.');
      return;
    }
    setSelectedRole('guest');
    router.replace('/');
  };

  return (
    <SafeScreen>
      <View className="flex-1 justify-center items-center px-8 gap-8">
        {/* Header */}
        <View className="items-center gap-3">
          <Text className="text-2xl font-bold text-black">Welcome</Text>
          <Text className="text-gray-600 text-center">
            Are you shopping or selling?
          </Text>
        </View>

        {/* Buyer Option */}
        <TouchableOpacity
          onPress={() => handleRoleSelection("buyer")}
          className="w-full bg-white border-2 border-blue-500 rounded-xl p-6 items-center gap-3"
        >
          <View className="w-16 h-16 bg-blue-100 rounded-full justify-center items-center">
            <Text className="text-2xl">🛍️</Text>
          </View>
          <Text className="text-lg font-semibold text-black">Shop as Buyer</Text>
          <Text className="text-sm text-gray-600 text-center">
            Browse and purchase products
          </Text>
        </TouchableOpacity>

        {/* Seller Option */}
        <TouchableOpacity
          onPress={() => handleRoleSelection("seller")}
          className="w-full bg-white border-2 border-green-500 rounded-xl p-6 items-center gap-3"
        >
          <View className="w-16 h-16 bg-green-100 rounded-full justify-center items-center">
            <Text className="text-2xl">📦</Text>
          </View>
          <Text className="text-lg font-semibold text-black">Sell as Seller</Text>
          <Text className="text-sm text-gray-600 text-center">
            Manage your shop and products
          </Text>
        </TouchableOpacity>

        {/* Guest Option (conditional) */}
        {guestEnabled === null ? (
          <View className="w-full items-center mt-4">
            <ActivityIndicator size="small" color="#999" />
          </View>
        ) : guestEnabled ? (
          <TouchableOpacity
            onPress={handleGuest}
            className="w-full bg-white border-2 border-gray-400 rounded-xl p-6 items-center gap-3"
          >
            <View className="w-16 h-16 bg-gray-100 rounded-full justify-center items-center">
              <Text className="text-2xl">👀</Text>
            </View>
            <Text className="text-lg font-semibold text-black">Browse as Guest</Text>
            <Text className="text-sm text-gray-600 text-center">
              Browse products and shops without signing in
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeScreen>
  );
};

export default RoleSelectionScreen;
