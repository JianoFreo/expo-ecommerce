import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

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
      const res = await axiosInstance.get("/api/admin/stats");
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
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 py-6 bg-red-600">
          <Text className="text-2xl font-bold text-white">Super Admin Dashboard</Text>
          <Text className="text-red-100 mt-1">Platform Management & Analytics</Text>
        </View>

        {/* Stats Grid */}
        <View className="px-4 py-4 gap-3">
          <View className="flex-row gap-3">
            {/* Total Products */}
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-gray-600 text-sm font-medium">Total Products</Text>
              <Text className="text-2xl font-bold text-red-600 mt-2">{stats?.totalProducts || 0}</Text>
            </View>

            {/* Total Orders */}
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-gray-600 text-sm font-medium">Total Orders</Text>
              <Text className="text-2xl font-bold text-blue-600 mt-2">{stats?.totalOrders || 0}</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            {/* Total Users */}
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-gray-600 text-sm font-medium">Total Users</Text>
              <Text className="text-2xl font-bold text-purple-600 mt-2">{stats?.totalUsers || 0}</Text>
            </View>

            {/* Total Shops */}
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-gray-600 text-sm font-medium">Total Shops</Text>
              <Text className="text-2xl font-bold text-green-600 mt-2">{stats?.totalShops || 0}</Text>
            </View>
          </View>

          <View className="bg-white rounded-lg p-4">
            <Text className="text-gray-600 text-sm font-medium">Total Revenue</Text>
            <Text className="text-3xl font-bold text-orange-600 mt-2">${stats?.totalRevenue || 0}</Text>
          </View>
        </View>
      </View>
    </SafeScreen>
  );
}
