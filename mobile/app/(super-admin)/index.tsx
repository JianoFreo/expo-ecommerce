import React from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Ionicons } from "@expo/vector-icons";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalShops: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/stats");
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
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">Super Admin</Text>
              <Text className="text-text-secondary text-sm mt-1">Platform Management & Analytics</Text>
            </View>
            <View className="bg-surface/50 p-3 rounded-full">
              <Ionicons name="shield-checkmark-outline" size={22} color="#ef4444" />
            </View>
          </View>
        </View>

        <View className="px-6 gap-3 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-5">
              <Text className="text-text-secondary text-sm font-medium">Total Products</Text>
              <Text className="text-3xl font-bold text-red-500 mt-2">{stats?.totalProducts || 0}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-5">
              <Text className="text-text-secondary text-sm font-medium">Total Orders</Text>
              <Text className="text-3xl font-bold text-blue-500 mt-2">{stats?.totalOrders || 0}</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-5">
              <Text className="text-text-secondary text-sm font-medium">Total Users</Text>
              <Text className="text-3xl font-bold text-purple-500 mt-2">{stats?.totalUsers || 0}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-5">
              <Text className="text-text-secondary text-sm font-medium">Total Shops</Text>
              <Text className="text-3xl font-bold text-green-500 mt-2">{stats?.totalShops || 0}</Text>
            </View>
          </View>

          <View className="bg-surface rounded-2xl p-5">
            <Text className="text-text-secondary text-sm font-medium">Total Revenue</Text>
            <Text className="text-3xl font-bold text-orange-500 mt-2">${stats?.totalRevenue || 0}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
