import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Order } from "@/types";

export default function SellerOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: async () => {
      // Replace with actual seller orders endpoint
      const res = await axiosInstance.get("/api/seller/orders");
      return res.data as Order[];
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
          <Text className="text-2xl font-bold text-black">Orders</Text>
          <Text className="text-gray-600 mt-1">Manage customer orders</Text>
        </View>

        {/* Orders List */}
        <FlatList
          data={orders || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-white mx-4 my-2 rounded-lg p-4">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-semibold text-black">Order #{item._id.slice(-6)}</Text>
                <Text
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : item.status === "shipped"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {item.status}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm">Customer: {item.user}</Text>
              <Text className="text-green-600 font-bold mt-2">${item.totalPrice}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </SafeScreen>
  );
}
