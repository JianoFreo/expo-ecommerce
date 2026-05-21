import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
}

export default function SellerAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["seller-analytics"],
    queryFn: async () => {
      // Replace with actual analytics endpoint
      const res = await axiosInstance.get("/api/seller/analytics");
      return res.data as AnalyticsData;
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
          <Text className="text-2xl font-bold text-black">Analytics</Text>
          <Text className="text-gray-600 mt-1">View your sales performance</Text>
        </View>

        {/* Analytics Cards */}
        <View className="px-4 py-4 gap-3">
          <View className="bg-white rounded-lg p-4">
            <Text className="text-gray-600 text-sm font-medium">Total Sales</Text>
            <Text className="text-3xl font-bold text-green-600 mt-2">
              ${analytics?.totalSales || 0}
            </Text>
          </View>

          <View className="bg-white rounded-lg p-4">
            <Text className="text-gray-600 text-sm font-medium">Total Orders</Text>
            <Text className="text-3xl font-bold text-blue-600 mt-2">
              {analytics?.totalOrders || 0}
            </Text>
          </View>

          <View className="bg-white rounded-lg p-4">
            <Text className="text-gray-600 text-sm font-medium">Average Order Value</Text>
            <Text className="text-3xl font-bold text-purple-600 mt-2">
              ${analytics?.averageOrderValue || 0}
            </Text>
          </View>

          <View className="bg-white rounded-lg p-4">
            <Text className="text-gray-600 text-sm font-medium">Conversion Rate</Text>
            <Text className="text-3xl font-bold text-orange-600 mt-2">
              {analytics?.conversionRate || 0}%
            </Text>
          </View>
        </View>
      </View>
    </SafeScreen>
  );
}
