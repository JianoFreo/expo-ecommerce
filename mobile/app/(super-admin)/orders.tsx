import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Order } from "@/types";

export default function AdminOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admin/orders");
      return res.data as { orders: Order[] };
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
          <Text className="text-2xl font-bold text-white">All Orders</Text>
          <Text className="text-red-100 mt-1">Platform order management</Text>
        </View>

        {/* Orders List */}
        <FlatList
          data={orders?.orders || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-white mx-4 my-2 rounded-lg p-4">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-semibold text-black">#{item._id.slice(-6)}</Text>
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
              <Text className="text-gray-600 text-sm">{item.orderItems?.length || 0} items</Text>
              <Text className="text-red-600 font-bold mt-2">${item.totalPrice}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </SafeScreen>
  );
}
