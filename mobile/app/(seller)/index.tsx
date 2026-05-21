import React from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function SellerDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["seller-dashboard-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/stats");
      return res.data as DashboardStats;
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
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">Dashboard</Text>
              <Text className="text-text-secondary text-sm mt-1">Manage your shop</Text>
            </View>
            <TouchableOpacity className="bg-surface/50 p-3 rounded-full" activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={22} color={"#fff"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 gap-3 mb-6">
          <View className="flex-row gap-3">
            {/* Total Products */}
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-start justify-start"
              activeOpacity={0.7}
              onPress={() => router.push("/(seller)/products")}
            >
              <View className="bg-green-500/20 p-2 rounded-lg mb-3">
                <Ionicons name="cube-outline" size={24} color="#10b981" />
              </View>
              <Text className="text-text-secondary text-sm font-medium">Products</Text>
              <Text className="text-3xl font-bold text-text-primary mt-2">{stats?.totalProducts || 0}</Text>
            </TouchableOpacity>

            {/* Total Orders */}
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-start justify-start"
              activeOpacity={0.7}
              onPress={() => router.push("/(seller)/orders")}
            >
              <View className="bg-blue-500/20 p-2 rounded-lg mb-3">
                <Ionicons name="cart-outline" size={24} color="#3b82f6" />
              </View>
              <Text className="text-text-secondary text-sm font-medium">Orders</Text>
              <Text className="text-3xl font-bold text-text-primary mt-2">{stats?.totalOrders || 0}</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            {/* Pending Orders */}
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-start justify-start"
              activeOpacity={0.7}
              onPress={() => router.push("/(seller)/orders")}
            >
              <View className="bg-yellow-500/20 p-2 rounded-lg mb-3">
                <Ionicons name="time-outline" size={24} color="#f59e0b" />
              </View>
              <Text className="text-text-secondary text-sm font-medium">Pending</Text>
              <Text className="text-3xl font-bold text-text-primary mt-2">{stats?.pendingOrders || 0}</Text>
            </TouchableOpacity>

            {/* Total Revenue */}
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-start justify-start"
              activeOpacity={0.7}
              onPress={() => router.push("/(seller)/analytics")}
            >
              <View className="bg-purple-500/20 p-2 rounded-lg mb-3">
                <Ionicons name="trending-up-outline" size={24} color="#a855f7" />
              </View>
              <Text className="text-text-secondary text-sm font-medium">Revenue</Text>
              <Text className="text-3xl font-bold text-text-primary mt-2">${stats?.totalRevenue?.toLocaleString() || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-text-primary font-bold text-lg mb-3">Quick Actions</Text>
          <View className="gap-2">
            <TouchableOpacity 
              className="bg-surface rounded-2xl p-4 flex-row items-center justify-between"
              activeOpacity={0.7}
              onPress={() => router.push("/(seller)/products")}
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-green-500/20 p-2 rounded-lg">
                  <Ionicons name="add-outline" size={20} color="#10b981" />
                </View>
                <Text className="text-text-primary font-semibold">Add New Product</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-surface rounded-2xl p-4 flex-row items-center justify-between"
              activeOpacity={0.7}
              onPress={() => router.push("/(seller)/orders")}
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-blue-500/20 p-2 rounded-lg">
                  <Ionicons name="list-outline" size={20} color="#3b82f6" />
                </View>
                <Text className="text-text-primary font-semibold">View Orders</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-surface rounded-2xl p-4 flex-row items-center justify-between"
              activeOpacity={0.7}
              onPress={() => router.push("/(seller)/analytics")}
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-purple-500/20 p-2 rounded-lg">
                  <Ionicons name="bar-chart-outline" size={20} color="#a855f7" />
                </View>
                <Text className="text-text-primary font-semibold">View Analytics</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
