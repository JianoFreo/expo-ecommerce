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
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-6 pt-6 pb-4">
          <Text className="text-text-primary text-3xl font-bold tracking-tight">Admin Profile</Text>
          <Text className="text-text-secondary text-sm mt-1">Platform management</Text>
        </View>

        <View className="px-6 py-4">
          <View className="bg-surface rounded-2xl p-6 items-center">
            <Image
              source={user?.imageUrl}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              transition={200}
            />
            <Text className="text-xl font-bold text-text-primary mt-4">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-text-secondary mt-1">
              {user?.emailAddresses?.[0]?.emailAddress}
            </Text>
            <View className="mt-3 px-4 py-1 bg-red-500/20 rounded-full">
              <Text className="text-red-500 font-semibold text-sm">Super Admin</Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-4 gap-3 mb-8">
          <Text className="text-lg font-bold text-text-primary mb-2">Account</Text>

          <TouchableOpacity
            onPress={() => handleSwitchRole("buyer")}
            className="bg-surface rounded-2xl p-4 border border-orange-300/30 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="swap-horizontal-outline" size={20} color="#ea580c" />
            <Text className="text-orange-600 font-semibold">Switch to Buyer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSwitchRole("seller")}
            className="bg-surface rounded-2xl p-4 border border-yellow-300/30 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="swap-horizontal-outline" size={20} color="#ca8a04" />
            <Text className="text-yellow-600 font-semibold">Switch to Seller</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-surface rounded-2xl p-4 border border-red-300/30 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text className="text-red-600 font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
