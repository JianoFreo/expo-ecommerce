import React from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Order } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";

export default function SellerOrders() {
  const { user } = useUser();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["seller-orders", user?.id],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/orders");
      return res.data as Order[];
    },
    enabled: !!user?.id,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return { bg: "bg-green-500/20", text: "text-green-600", icon: "checkmark-circle-outline", iconColor: "#16a34a" };
      case "shipped":
        return { bg: "bg-blue-500/20", text: "text-blue-600", icon: "send-outline", iconColor: "#2563eb" };
      case "pending":
        return { bg: "bg-yellow-500/20", text: "text-yellow-600", icon: "time-outline", iconColor: "#ca8a04" };
      default:
        return { bg: "bg-gray-500/20", text: "text-gray-600", icon: "help-circle-outline", iconColor: "#4b5563" };
    }
  };

  const isEmpty = !orders || orders.length === 0;

  return (
    <SafeScreen>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">Orders</Text>
              <Text className="text-text-secondary text-sm mt-1">{orders?.length || 0} total orders</Text>
            </View>
            <TouchableOpacity className="bg-surface/50 p-3 rounded-full" activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={24} color={"#fff"} />
            </TouchableOpacity>
          </View>
        </View>

        {isEmpty ? (
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-surface rounded-2xl p-8 items-center">
              <View className="bg-blue-500/20 p-4 rounded-full mb-4">
                <Ionicons name="cart-outline" size={40} color="#3b82f6" />
              </View>
              <Text className="text-text-primary text-lg font-bold mt-2">No Orders Yet</Text>
              <Text className="text-text-secondary text-center mt-2">Your orders will appear here</Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const colorScheme = getStatusColor(item.status);
              return (
                <TouchableOpacity 
                  className="bg-surface mx-6 my-2 rounded-2xl p-4"
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="font-bold text-text-primary">Order #{item._id.slice(-8).toUpperCase()}</Text>
                      <Text className="text-text-secondary text-xs mt-1">
                        {item.orderItems?.length || 0} item{(item.orderItems?.length || 0) !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <View className={`${colorScheme.bg} px-3 py-1 rounded-full flex-row items-center gap-1`}>
                      <Ionicons name={colorScheme.icon as any} size={14} color={colorScheme.iconColor} />
                      <Text className={`${colorScheme.text} font-bold text-xs capitalize`}>{item.status}</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center pt-2 border-t border-surface/50">
                    <Text className="text-text-secondary text-sm mt-2">Total</Text>
                    <Text className="text-green-600 font-bold text-lg mt-2">${item.totalPrice?.toLocaleString() || 0}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
            scrollIndicatorInsets={{ right: 1 }}
          />
        )}
      </View>
    </SafeScreen>
  );
}
