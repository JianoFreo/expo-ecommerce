import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Product } from "@/types";

export default function AdminProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admin/products");
      return res.data as Product[];
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
          <Text className="text-2xl font-bold text-white">All Products</Text>
          <Text className="text-red-100 mt-1">Manage platform products</Text>
        </View>

        {/* Products List */}
        <FlatList
          data={products || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-white mx-4 my-2 rounded-lg p-4 flex-row gap-4">
              <View className="w-20 h-20 bg-gray-200 rounded-lg justify-center items-center">
                <Text className="text-2xl">📦</Text>
              </View>
              <View className="flex-1 justify-center">
                <Text className="font-semibold text-black">{item.name}</Text>
                <Text className="text-gray-600 text-sm">{item.shop?.name}</Text>
                <Text className="text-red-600 font-bold mt-1">${item.price}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </SafeScreen>
  );
}
