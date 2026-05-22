import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Shop } from "@/types";

export default function AdminShops() {
  const { data: shopsData, isLoading } = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/shops");
      return res.data as { shops: Shop[] };
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
          <Text className="text-text-primary text-3xl font-bold tracking-tight">All Shops</Text>
          <Text className="text-text-secondary text-sm mt-1">Manage seller shops</Text>
        </View>

        {/* Shops List */}
        <FlatList
          data={shopsData?.shops || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-surface mx-6 my-2 rounded-2xl p-4">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="font-semibold text-text-primary text-lg">{item.name}</Text>
                  <Text className="text-text-secondary text-sm mt-1">{item.description}</Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    item.isActive ? "bg-green-500/20" : "bg-gray-500/20"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      item.isActive ? "text-green-500" : "text-text-secondary"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
              <Text className="text-text-secondary text-sm">Owner: {item.owner?.name}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
        />
      </View>
    </SafeScreen>
  );
}
