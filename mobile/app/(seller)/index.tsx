import React from "react";
import { View, Text, SectionList, ActivityIndicator } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

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
      // Replace with actual endpoint
      const res = await axiosInstance.get("/api/seller/stats");
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
        <View className="px-4 py-6 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-black">Seller Dashboard</Text>
          <Text className="text-gray-600 mt-1">Welcome back! Here's your shop overview</Text>
        </View>

        {/* Stats Grid */}
        <View className="px-4 py-4 gap-3">
          <View className="flex-row gap-3">
            {/* Total Products */}
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-gray-600 text-sm font-medium">Total Products</Text>
              <Text className="text-2xl font-bold text-green-600 mt-2">{stats?.totalProducts || 0}</Text>
            </View>

            {/* Total Orders */}
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-gray-600 text-sm font-medium">Total Orders</Text>
              <Text className="text-2xl font-bold text-blue-600 mt-2">{stats?.totalOrders || 0}</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            {/* Pending Orders */}
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-gray-600 text-sm font-medium">Pending Orders</Text>
              <Text className="text-2xl font-bold text-orange-600 mt-2">{stats?.pendingOrders || 0}</Text>
            </View>

            {/* Total Revenue */}
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-gray-600 text-sm font-medium">Total Revenue</Text>
              <Text className="text-2xl font-bold text-purple-600 mt-2">${stats?.totalRevenue || 0}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-black mb-3">Quick Actions</Text>
          <View className="bg-white rounded-lg p-4 gap-3">
            <Text className="text-gray-700">📦 Add New Product</Text>
            <Text className="text-gray-700">📋 Manage Inventory</Text>
            <Text className="text-gray-700">🎯 View Orders</Text>
          </View>
        </View>
      </View>
    </SafeScreen>
  );
}
