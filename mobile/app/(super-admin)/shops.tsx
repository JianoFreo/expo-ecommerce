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
      const res = await axiosInstance.get("/api/admin/shops");
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
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 py-6 bg-red-600">
          <Text className="text-2xl font-bold text-white">All Shops</Text>
          <Text className="text-red-100 mt-1">Manage seller shops</Text>
        </View>

        {/* Shops List */}
        <FlatList
          data={shopsData?.shops || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-white mx-4 my-2 rounded-lg p-4">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="font-semibold text-black text-lg">{item.name}</Text>
                  <Text className="text-gray-600 text-sm mt-1">{item.description}</Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    item.isActive ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      item.isActive ? "text-green-700" : "text-gray-500"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-600 text-sm">Owner: {item.owner?.name}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </SafeScreen>
  );
}
