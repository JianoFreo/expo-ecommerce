import React from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Switch, Alert } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useUser } from "@clerk/clerk-expo";

interface BannerState {
  productId: string;
  badgeText: string;
  ctaText: string;
  isActive: boolean;
}

const defaultForm: BannerState = {
  productId: "",
  badgeText: "Best Deals",
  ctaText: "Shop Now",
  isActive: true,
};

export default function SuperAdminBanner() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState<BannerState>(defaultForm);
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products", user?.id],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/products");
      return res.data as Product[];
    },
    enabled: !!user?.id,
  });

  const { data: bannerData, isLoading: bannerLoading } = useQuery({
    queryKey: ["homeBanner", user?.id],
    queryFn: async () => {
      const res = await axiosInstance.get("/banner");
      return res.data as { banner: any };
    },
    enabled: !!user?.id,
  });

  React.useEffect(() => {
    if (bannerData?.banner) {
      setForm({
        productId: bannerData.banner.product?._id || bannerData.banner.product || "",
        badgeText: bannerData.banner.badgeText || "Best Deals",
        ctaText: bannerData.banner.ctaText || "Shop Now",
        isActive: bannerData.banner.isActive ?? true,
      });
    }
  }, [bannerData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.productId) throw new Error("Select a product for the banner.");
      return axiosInstance.put("/admin/banner", form);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["homeBanner", user?.id] });
      Alert.alert("Success", "Homepage banner updated.");
    },
    onError: (err: any) => {
      Alert.alert("Update failed", err?.response?.data?.message || err?.message || "Could not update banner");
    },
  });

  if (productsLoading || bannerLoading) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeScreen>
    );
  }

  const selectedProduct = products?.find((product) => product._id === form.productId) || null;
  const filteredProducts = (products || []).filter((product) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      product.name.toLowerCase().includes(term) ||
      (product.description || "").toLowerCase().includes(term) ||
      (product.shop?.name || "").toLowerCase().includes(term)
    );
  });

  return (
    <SafeScreen>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">Homepage Banner</Text>
              <Text className="text-text-secondary text-sm mt-1">Matches the web dashboard banner editor</Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${form.isActive ? "bg-green-500/20" : "bg-surface/50"}`}>
              <Text className={form.isActive ? "text-green-500 font-semibold text-xs" : "text-text-secondary font-semibold text-xs"}>
                {form.isActive ? "Active" : "Hidden"}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 mb-6">
          <View className="bg-surface rounded-2xl p-5 gap-4">
            <View className="rounded-3xl p-5 flex-row items-center justify-between gap-4 bg-black/20">
              {selectedProduct ? (
                <>
                  <View className="flex-1 gap-2">
                    <View className="self-start bg-red-500/20 px-3 py-1 rounded-full">
                      <Text className="text-red-500 font-semibold text-xs">{form.badgeText || "Best Deals"}</Text>
                    </View>
                    <Text className="text-text-primary text-2xl font-bold">{selectedProduct.name}</Text>
                    <Text className="text-text-secondary" numberOfLines={2}>{selectedProduct.description}</Text>
                    <TouchableOpacity className="bg-red-500 self-start rounded-full px-4 py-2 mt-1">
                      <Text className="text-white font-bold">{form.ctaText || "Shop Now"}</Text>
                    </TouchableOpacity>
                  </View>
                  <Image source={selectedProduct.images?.[0]} style={{ width: 110, height: 110, borderRadius: 18 }} contentFit="cover" />
                </>
              ) : (
                <View className="flex-1 items-center py-8">
                  <Ionicons name="image-outline" size={42} color="#666" />
                  <Text className="text-text-secondary mt-2">Select a product to preview the banner</Text>
                </View>
              )}
            </View>

            <View className="gap-3">
              <Text className="text-text-secondary text-sm font-medium mb-1">Product</Text>
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search products by name, description, or shop"
                placeholderTextColor="#8a8a8a"
                className="bg-black/20 text-white rounded-xl px-4 py-3"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {filteredProducts.map((product) => (
                  <TouchableOpacity
                    key={product._id}
                    onPress={() => setForm((current) => ({ ...current, productId: product._id }))}
                    className={`px-3 py-2 rounded-full ${form.productId === product._id ? "bg-red-500" : "bg-black/20"}`}
                  >
                    <Text className={form.productId === product._id ? "text-white font-semibold" : "text-text-secondary"}>{product.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {searchTerm.trim() && filteredProducts.length === 0 && (
                <Text className="text-text-secondary text-sm">No products match your search.</Text>
              )}

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-text-secondary text-sm font-medium mb-1">Badge Text</Text>
                  <TextInput
                    value={form.badgeText}
                    onChangeText={(value) => setForm((current) => ({ ...current, badgeText: value }))}
                    placeholder="Best Deals"
                    placeholderTextColor="#8a8a8a"
                    className="bg-black/20 text-white rounded-xl px-4 py-3"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-text-secondary text-sm font-medium mb-1">CTA Text</Text>
                  <TextInput
                    value={form.ctaText}
                    onChangeText={(value) => setForm((current) => ({ ...current, ctaText: value }))}
                    placeholder="Shop Now"
                    placeholderTextColor="#8a8a8a"
                    className="bg-black/20 text-white rounded-xl px-4 py-3"
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between bg-black/20 rounded-xl px-4 py-3">
                <Text className="text-text-primary font-semibold">Show on app</Text>
                <Switch
                  value={form.isActive}
                  onValueChange={(value) => setForm((current) => ({ ...current, isActive: value }))}
                />
              </View>

              <TouchableOpacity
                onPress={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="bg-red-500 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-bold">{saveMutation.isPending ? "Saving..." : "Save Banner"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
