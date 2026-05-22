import React from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { User } from "@/types";
import { Ionicons } from "@expo/vector-icons";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/users");
      return (res.data?.users || []) as User[];
    },
  });

  const toggleBanMutation = useMutation({
    mutationFn: async (user: User) => {
      const endpoint = user.isBanned ? `/admin/users/${user._id}/unban` : `/admin/users/${user._id}/ban`;
      return axiosInstance.patch(endpoint);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      Alert.alert("Update failed", error?.response?.data?.message || error?.message || "Could not update user");
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
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 py-24">
              <View className="bg-surface rounded-2xl p-6 w-full items-center">
                <Ionicons name="people-outline" size={36} color="#666" />
                <Text className="text-text-primary font-bold text-lg mt-3">No users found</Text>
                <Text className="text-text-secondary text-center mt-1">
                  The user list is empty or still loading from the backend.
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-surface mx-6 my-2 rounded-2xl p-4 gap-4">
              <View className="flex-row gap-4 items-center">
                <View className="w-12 h-12 bg-red-500/20 rounded-full justify-center items-center">
                  <Text className="text-xl">👤</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-text-primary">{item.name}</Text>
                  <Text className="text-text-secondary text-sm">{item.email}</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Text className="text-xs text-text-secondary">{item.role}</Text>
                    {item.isBanned ? (
                      <Text className="text-xs font-semibold text-red-400">Banned</Text>
                    ) : (
                      <Text className="text-xs font-semibold text-green-400">Active</Text>
                    )}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => toggleBanMutation.mutate(item)}
                disabled={toggleBanMutation.isPending}
                className={`rounded-xl py-3 px-4 flex-row items-center justify-center gap-2 ${
                  item.isBanned ? "bg-green-600" : "bg-red-600"
                }`}
              >
                <Ionicons name={item.isBanned ? "lock-open-outline" : "lock-closed-outline"} size={18} color="#fff" />
                <Text className="text-white font-semibold">
                  {item.isBanned ? "Unban User" : "Ban User"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
        />
      </View>
    </SafeScreen>
  );
}
