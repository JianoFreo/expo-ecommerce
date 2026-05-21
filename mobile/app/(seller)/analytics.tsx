import React from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";

interface Analytics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
}

export default function SellerAnalytics() {
  const { user } = useUser();
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["seller-analytics", user?.id],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/analytics");
      return res.data as Analytics;
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

  const metrics = [
    {
      label: "Total Sales",
      value: `$${analytics?.totalSales?.toLocaleString() || 0}`,
      icon: "cash-outline",
      color: "#10b981",
      bg: "bg-green-500/20",
    },
    {
      label: "Total Orders",
      value: analytics?.totalOrders || 0,
      icon: "cart-outline",
      color: "#3b82f6",
      bg: "bg-blue-500/20",
    },
    {
      label: "Avg Order Value",
      value: `$${analytics?.averageOrderValue?.toFixed(2) || 0}`,
      icon: "trending-up-outline",
      color: "#a855f7",
      bg: "bg-purple-500/20",
    },
    {
      label: "Conversion Rate",
      value: `${analytics?.conversionRate || 0}%`,
      icon: "stats-chart-outline",
      color: "#f59e0b",
      bg: "bg-yellow-500/20",
    },
  ];

  return (
    <SafeScreen>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">Analytics</Text>
              <Text className="text-text-secondary text-sm mt-1">Performance insights</Text>
            </View>
            <TouchableOpacity className="bg-surface/50 p-3 rounded-full" activeOpacity={0.7}>
              <Ionicons name="calendar-outline" size={24} color={"#fff"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics Grid */}
        <View className="px-6 gap-3 mb-6">
          {metrics.map((metric, idx) => (
            <View key={idx} className={`${metric.bg} rounded-2xl p-5`}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-text-secondary text-sm font-medium mb-3">{metric.label}</Text>
                  <Text className="text-3xl font-bold text-text-primary">{metric.value}</Text>
                </View>
                <View className={`${metric.bg} p-3 rounded-xl`} style={{ backgroundColor: metric.color + "30" }}>
                  <Ionicons name={metric.icon as any} size={24} color={metric.color} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Details Section */}
        <View className="px-6">
          <Text className="text-text-primary font-bold text-lg mb-3">Performance Summary</Text>
          <View className="bg-surface rounded-2xl p-5 gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-green-500/20 p-2 rounded-lg">
                  <Ionicons name="arrow-up-outline" size={20} color="#10b981" />
                </View>
                <View>
                  <Text className="text-text-secondary text-sm">Revenue Trend</Text>
                  <Text className="text-text-primary font-bold">
                    {analytics?.totalOrders ? "No trend data" : "No products yet"}
                  </Text>
                </View>
              </View>
              <Text className="text-text-secondary font-bold">
                {analytics?.totalOrders ? `${analytics?.conversionRate || 0}%` : "N/A"}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-blue-500/20 p-2 rounded-lg">
                  <Ionicons name="people-outline" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text className="text-text-secondary text-sm">Customer Activity</Text>
                  <Text className="text-text-primary font-bold">Active</Text>
                </View>
              </View>
              <Text className="text-blue-600 font-bold">{analytics?.totalOrders || 0} orders</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-purple-500/20 p-2 rounded-lg">
                  <Ionicons name="bar-chart-outline" size={20} color="#a855f7" />
                </View>
                <View>
                  <Text className="text-text-secondary text-sm">Overall Health</Text>
                  <Text className="text-text-primary font-bold">Excellent</Text>
                </View>
              </View>
              <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
