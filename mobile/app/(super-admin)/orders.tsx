import React from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Order } from "@/types";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
            <TouchableOpacity
              className="bg-surface mx-6 my-2 rounded-2xl p-4"
              activeOpacity={0.7}
              onPress={() => router.push(`/(super-admin)/order/${item._id}`)}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="font-semibold text-text-primary">#{item._id.slice(-6)}</Text>
                  <Text className="text-text-secondary text-xs mt-1">
                    {item.user?.name || "Unknown buyer"}
                  </Text>
                </View>
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
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-text-secondary text-sm">{item.orderItems?.length || 0} items</Text>
                  <Text className="text-red-500 font-bold mt-2">${Number(item.totalPrice || 0).toFixed(2)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#666" />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
        />
      </View>
    </SafeScreen>
  );
}
