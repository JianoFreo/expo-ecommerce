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
      const res = await axiosInstance.get("/admin/users");
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
      <View className="flex-1">
        <View className="px-6 pt-6 pb-4">
          <Text className="text-text-primary text-3xl font-bold tracking-tight">All Users</Text>
          <Text className="text-text-secondary text-sm mt-1">Manage platform users</Text>
        </View>

        {/* Users List */}
        <FlatList
          data={users || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-surface mx-6 my-2 rounded-2xl p-4 flex-row gap-4 items-center">
              <View className="w-12 h-12 bg-red-500/20 rounded-full justify-center items-center">
                <Text className="text-xl">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-text-primary">{item.name}</Text>
                <Text className="text-text-secondary text-sm">{item.email}</Text>
                <Text className="text-xs text-text-secondary mt-1">{item.role}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
        />
      </View>
    </SafeScreen>
  );
}
