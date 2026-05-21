import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Product } from "@/types";

export default function SellerProducts() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => {
      // Replace with actual seller products endpoint
      const res = await axiosInstance.get("/api/seller/products");
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
        <View className="px-4 py-6 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-black">Your Products</Text>
          <Text className="text-gray-600 mt-1">Manage your shop inventory</Text>
        </View>

        {/* Products List */}
        <FlatList
          data={products || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-white mx-4 my-2 rounded-lg p-4 flex-row gap-4">
              <View className="w-20 h-20 bg-gray-200 rounded-lg">
                {item.images?.[0] && (
                  <Text className="text-gray-500 text-center mt-7">📦</Text>
                )}
              </View>
              <View className="flex-1 justify-center">
                <Text className="font-semibold text-black">{item.name}</Text>
                <Text className="text-green-600 font-bold mt-1">${item.price}</Text>
                <Text className="text-gray-600 text-sm">Stock: {item.stock}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </SafeScreen>
  );
}
