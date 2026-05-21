import React from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";

export default function SellerProducts() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["seller-products"],
    queryFn: async () => {
      // Replace with actual seller products endpoint
      const res = await axiosInstance.get("/seller/products");
      return res.data as Product[];
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

  const isEmpty = !products || products.length === 0;

  return (
    <SafeScreen>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">Products</Text>
              <Text className="text-text-secondary text-sm mt-1">{products?.length || 0} items listed</Text>
            </View>
            <TouchableOpacity className="bg-surface/50 p-3 rounded-full" activeOpacity={0.7}>
              <Ionicons name="add-outline" size={24} color={"#fff"} />
            </TouchableOpacity>
          </View>
        </View>

        {isEmpty ? (
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-surface rounded-2xl p-8 items-center">
              <View className="bg-green-500/20 p-4 rounded-full mb-4">
                <Ionicons name="cube-outline" size={40} color="#10b981" />
              </View>
              <Text className="text-text-primary text-lg font-bold mt-2">No Products Yet</Text>
              <Text className="text-text-secondary text-center mt-2">Start adding products to your shop</Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="bg-surface mx-6 my-2 rounded-2xl p-4 flex-row gap-4 items-start"
                activeOpacity={0.7}
              >
                <View className="w-24 h-24 bg-surface/50 rounded-xl overflow-hidden items-center justify-center">
                  {item.images?.[0] ? (
                    <Image source={{ uri: item.images[0] }} className="w-full h-full" />
                  ) : (
                    <Ionicons name="cube-outline" size={32} color="#666" />
                  )}
                </View>
                
                <View className="flex-1 justify-between pt-1">
                  <View>
                    <Text className="font-bold text-text-primary" numberOfLines={2}>{item.name}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <View className="bg-green-500/20 px-2 py-1 rounded-lg">
                        <Text className="text-green-600 font-bold text-sm">${item.price}</Text>
                      </View>
                      <Text className="text-text-secondary text-xs">Stock: {item.stock}</Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2 mt-2">
                    <View className="flex-1 bg-surface/50 rounded-lg p-1.5 items-center">
                      <Ionicons name="create-outline" size={14} color="#666" />
                    </View>
                    <View className="flex-1 bg-surface/50 rounded-lg p-1.5 items-center">
                      <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
            scrollIndicatorInsets={{ right: 1 }}
          />
        )}
      </View>
    </SafeScreen>
  );
}
