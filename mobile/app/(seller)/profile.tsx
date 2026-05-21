import React from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Shop } from "@/types";
import { useAuthManager } from "@/hooks/useAuthManager";

export default function SellerProfile() {
  const { data: shop, isLoading } = useQuery({
    queryKey: ["seller-shop"],
    queryFn: async () => {
      // Get current user's shop
      const res = await axiosInstance.get("/api/user/profile");
      return res.data.shop as Shop;
    },
  });

  const { handleLogout, handleSwitchRole } = useAuthManager();

  if (isLoading) {
    return (
      <SafeScreen>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 py-6 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-black">Shop Profile</Text>
          <Text className="text-gray-600 mt-1">Manage your shop information</Text>
        </View>

        {/* Shop Info */}
        <View className="px-4 py-4 gap-4">
          <View className="bg-white rounded-lg p-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">Shop Name</Text>
            <TextInput
              placeholder="Your shop name"
              value={shop?.name || ""}
              editable={false}
              className="border border-gray-300 rounded-lg p-3 text-black"
            />
          </View>

          <View className="bg-white rounded-lg p-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">Description</Text>
            <TextInput
              placeholder="Shop description"
              value={shop?.description || ""}
              editable={false}
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-lg p-3 text-black"
            />
          </View>

          <TouchableOpacity className="bg-green-600 rounded-lg p-4 items-center">
            <Text className="text-white font-semibold">Edit Shop Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View className="px-4 py-4 gap-3 mb-8">
          <Text className="text-lg font-bold text-black mb-2">Account</Text>

          <TouchableOpacity
            onPress={handleSwitchRole}
            className="bg-white rounded-lg p-4 border border-orange-300 items-center"
          >
            <Text className="text-orange-600 font-semibold">Switch Role</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 rounded-lg p-4 items-center"
          >
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
