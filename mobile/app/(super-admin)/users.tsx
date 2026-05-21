import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { User } from "@/types";

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admin/users");
      return res.data as User[];
    },
  });

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
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 py-6 bg-red-600">
          <Text className="text-2xl font-bold text-white">All Users</Text>
          <Text className="text-red-100 mt-1">Manage platform users</Text>
        </View>

        {/* Users List */}
        <FlatList
          data={users || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-white mx-4 my-2 rounded-lg p-4 flex-row gap-4 items-center">
              <View className="w-12 h-12 bg-red-200 rounded-full justify-center items-center">
                <Text className="text-xl">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-black">{item.name}</Text>
                <Text className="text-gray-600 text-sm">{item.email}</Text>
                <Text className="text-xs text-gray-500 mt-1">{item.role}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </SafeScreen>
  );
}
