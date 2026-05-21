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
      const res = await axiosInstance.get("/admin/orders");
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
      <View className="flex-1">
        <View className="px-6 pt-6 pb-4">
          <Text className="text-text-primary text-3xl font-bold tracking-tight">All Orders</Text>
          <Text className="text-text-secondary text-sm mt-1">Platform order management</Text>
        </View>

        {/* Orders List */}
        <FlatList
          data={orders?.orders || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-surface mx-6 my-2 rounded-2xl p-4">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-semibold text-text-primary">#{item._id.slice(-6)}</Text>
                <Text
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === "delivered"
                      ? "bg-green-500/20 text-green-500"
                      : item.status === "shipped"
                      ? "bg-blue-500/20 text-blue-500"
                      : "bg-orange-500/20 text-orange-500"
                  }`}
                >
                  {item.status}
                </Text>
              </View>
              <Text className="text-text-secondary text-sm">{item.orderItems?.length || 0} items</Text>
              <Text className="text-red-500 font-bold mt-2">${item.totalPrice}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
        />
      </View>
    </SafeScreen>
  );
}
