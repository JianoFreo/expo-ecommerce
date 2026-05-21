import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useAuthManager } from "@/hooks/useAuthManager";
import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export default function SuperAdminProfile() {
  const { user } = useUser();
  const { handleLogout, handleSwitchRole } = useAuthManager();

  return (
    <SafeScreen>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 py-6 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-black">Admin Profile</Text>
          <Text className="text-gray-600 mt-1">Platform management</Text>
        </View>

        {/* User Info */}
        <View className="px-4 py-6">
          <View className="bg-white rounded-lg p-6 items-center">
            <Image
              source={user?.imageUrl}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              transition={200}
            />
            <Text className="text-xl font-bold text-black mt-4">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-gray-600 mt-1">
              {user?.emailAddresses?.[0]?.emailAddress}
            </Text>
            <View className="mt-3 px-4 py-1 bg-red-100 rounded-full">
              <Text className="text-red-600 font-semibold text-sm">Super Admin</Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View className="px-4 py-4 gap-3 mb-8">
          <Text className="text-lg font-bold text-black mb-2">Account</Text>

          <TouchableOpacity
            onPress={() => handleSwitchRole("buyer")}
            className="bg-white rounded-lg p-4 border border-orange-300 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="swap-horizontal-outline" size={20} color="#ea580c" />
            <Text className="text-orange-600 font-semibold">Switch to Buyer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSwitchRole("seller")}
            className="bg-white rounded-lg p-4 border border-yellow-300 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="swap-horizontal-outline" size={20} color="#ca8a04" />
            <Text className="text-yellow-600 font-semibold">Switch to Seller</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white rounded-lg p-4 border border-red-300 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text className="text-red-600 font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
