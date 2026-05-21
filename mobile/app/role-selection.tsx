import { View, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useRole } from "@/context/RoleContext";
import SafeScreen from "@/components/SafeScreen";

const RoleSelectionScreen = () => {
  const { setSelectedRole } = useRole();

  const handleRoleSelection = (role: "buyer" | "seller") => {
    setSelectedRole(role);
    router.replace("/(auth)");
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
      </View>
    </SafeScreen>
  );
};

export default RoleSelectionScreen;
