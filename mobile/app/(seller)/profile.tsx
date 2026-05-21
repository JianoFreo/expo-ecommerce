import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Shop } from "@/types";
import { useAuthManager } from "@/hooks/useAuthManager";
import { Image } from "expo-image";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function SellerProfile() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [editVisible, setEditVisible] = React.useState(false);
  const [shopName, setShopName] = React.useState("");
  const [shopDescription, setShopDescription] = React.useState("");

  const { data: shop, isLoading } = useQuery({
    queryKey: ["seller-shop"],
    queryFn: async () => {
      const res = await axiosInstance.get("/user/profile");
      return res.data.shop as Shop;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["seller-shop-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/stats");
      return res.data as { totalProducts: number; totalOrders: number; totalRevenue: number };
    },
  });

  React.useEffect(() => {
    setShopName(shop?.name || "");
    setShopDescription(shop?.description || "");
  }, [shop?.name, shop?.description]);

  const updateShopMutation = useMutation({
    mutationFn: async () => {
      if (!shopName.trim()) throw new Error("Shop name is required.");
      return axiosInstance.patch("/seller/shop", {
        name: shopName.trim(),
        description: shopDescription.trim(),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-shop"] });
      setEditVisible(false);
    },
    onError: (err: any) => {
      Alert.alert("Update failed", err?.response?.data?.message || err?.message || "Could not update shop");
    },
  });

  const { handleLogout, handleSwitchRole } = useAuthManager();

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
          <View className="bg-surface rounded-2xl p-6 items-center">
            <Image
              source={user?.imageUrl}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              transition={200}
            />
            <Text className="text-text-primary text-xl font-bold mt-4">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-text-secondary mt-1 text-sm">
              {user?.emailAddresses?.[0]?.emailAddress}
            </Text>
            <View className="mt-3 px-4 py-1 bg-green-100 rounded-full">
              <Text className="text-green-600 font-semibold text-sm">Seller</Text>
            </View>
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-text-primary font-bold text-lg mb-3">Shop Details</Text>
          <View className="bg-surface rounded-2xl p-5 gap-4">
            <View>
              <Text className="text-text-secondary text-sm font-medium mb-2">Shop Name</Text>
              <View className="bg-surface/50 rounded-xl p-3">
                <Text className="text-text-primary font-semibold">{shop?.name || "Your Shop"}</Text>
              </View>
            </View>

            <View>
              <Text className="text-text-secondary text-sm font-medium mb-2">Description</Text>
              <View className="bg-surface/50 rounded-xl p-3 min-h-20">
                <Text className="text-text-primary">{shop?.description || "No description added"}</Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-green-600 rounded-xl p-3.5 items-center flex-row justify-center gap-2"
              onPress={() => setEditVisible(true)}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text className="text-white font-bold">Edit Shop Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-text-primary font-bold text-lg mb-3">Quick Stats</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
              <View className="bg-blue-500/20 p-2 rounded-lg mb-2">
                <Ionicons name="cube-outline" size={20} color="#3b82f6" />
              </View>
              <Text className="text-text-secondary text-xs">Products</Text>
              <Text className="text-text-primary font-bold text-lg mt-1">{stats?.totalProducts || 0}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
              <View className="bg-green-500/20 p-2 rounded-lg mb-2">
                <Ionicons name="cart-outline" size={20} color="#10b981" />
              </View>
              <Text className="text-text-secondary text-xs">Orders</Text>
              <Text className="text-text-primary font-bold text-lg mt-1">{stats?.totalOrders || 0}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
              <View className="bg-purple-500/20 p-2 rounded-lg mb-2">
                <Ionicons name="trending-up-outline" size={20} color="#a855f7" />
              </View>
              <Text className="text-text-secondary text-xs">Revenue</Text>
              <Text className="text-text-primary font-bold text-lg mt-1">${stats?.totalRevenue?.toLocaleString() || 0}</Text>
            </View>
          </View>
        </View>

        <View className="px-6 gap-3 mb-6">
          <Text className="text-text-primary font-bold text-lg">Account</Text>

          <TouchableOpacity
            onPress={() => handleSwitchRole("buyer")}
            className="bg-surface rounded-2xl p-4 border border-orange-300/30 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-orange-500/20 p-2 rounded-lg">
                <Ionicons name="swap-horizontal-outline" size={20} color="#ea580c" />
              </View>
              <Text className="text-orange-600 font-semibold">Switch to Buyer</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-surface rounded-2xl p-4 border border-red-300/30 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-red-500/20 p-2 rounded-lg">
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              </View>
              <Text className="text-red-600 font-semibold">Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={editVisible} onRequestClose={() => setEditVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-surface rounded-t-3xl p-5 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-text-primary text-xl font-bold">Edit Shop</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              value={shopName}
              onChangeText={setShopName}
              placeholder="Shop name"
              placeholderTextColor="#8a8a8a"
              className="bg-black/20 text-white rounded-xl px-4 py-3"
            />
            <TextInput
              value={shopDescription}
              onChangeText={setShopDescription}
              placeholder="Description"
              placeholderTextColor="#8a8a8a"
              className="bg-black/20 text-white rounded-xl px-4 py-3 min-h-24"
              multiline
            />

            <TouchableOpacity
              onPress={() => updateShopMutation.mutate()}
              disabled={updateShopMutation.isPending}
              className="bg-green-600 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-bold">
                {updateShopMutation.isPending ? "Saving..." : "Save Shop"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}
