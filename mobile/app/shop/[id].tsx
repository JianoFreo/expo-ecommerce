import SafeScreen from "@/components/SafeScreen";
import { useApi } from "@/lib/api";
import { Shop, Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import ProductsGrid from "@/components/ProductsGrid";

const ShopDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const api = useApi();

  const { data: shop, isLoading: isShopLoading, isError: isShopError } = useQuery<Shop>({
    queryKey: ["shop", id],
    queryFn: async () => {
      const response = await api.get(`/shops/${id}`);
      return response.data.shop;
    },
    enabled: !!id,
  });

  const { data: products = [], isLoading: isProductsLoading, isError: isProductsError } = useQuery<Product[]>({
    queryKey: ["shop-products", id],
    queryFn: async () => {
      const response = await api.get(`/shops/${id}/products`);
      return response.data.products || [];
    },
    enabled: !!id,
  });

  if (isShopLoading) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text className="text-text-secondary mt-4">Loading shop...</Text>
        </View>
      </SafeScreen>
    );
  }

  if (isShopError || !shop) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text className="text-text-primary font-semibold mt-4">Failed to load shop</Text>
          <TouchableOpacity
            className="mt-6 bg-primary px-6 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-black font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary font-bold text-lg flex-1 ml-4" numberOfLines={1}>
          {shop.name}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* BANNER IMAGE */}
        {shop.bannerImage && (
          <View className="h-48 w-full mb-6">
            <Image
              source={shop.bannerImage}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </View>
        )}

        {/* SHOP INFO */}
        <View className="px-6 mb-8">
          <Text className="text-text-primary font-bold text-2xl mb-2">{shop.name}</Text>

          {shop.owner && (
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                <Text className="text-black font-bold text-sm">
                  {shop.owner.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold">{shop.owner.name}</Text>
                <Text className="text-text-secondary text-xs">{shop.owner.email}</Text>
              </View>
            </View>
          )}

          {shop.description && (
            <Text className="text-text-secondary mb-4 leading-6">{shop.description}</Text>
          )}

          <View className="flex-row items-center gap-4">
            <View className="items-center">
              <Text className="text-primary font-bold text-lg">{products.length}</Text>
              <Text className="text-text-secondary text-xs">Products</Text>
            </View>
            <View className="w-px h-8 bg-surface" />
            <View className="items-center">
              <Text className="text-primary font-bold text-lg">
                {shop.isActive ? "Active" : "Inactive"}
              </Text>
              <Text className="text-text-secondary text-xs">Status</Text>
            </View>
          </View>
        </View>

        {/* PRODUCTS SECTION */}
        <View className="px-6">
          <Text className="text-text-primary font-bold text-lg mb-4">Products from this shop</Text>

          {isProductsLoading ? (
            <View className="py-8 items-center justify-center">
              <ActivityIndicator size="large" color="#00D9FF" />
            </View>
          ) : isProductsError || products.length === 0 ? (
            <View className="py-8 items-center justify-center">
              <Ionicons name="search-outline" size={48} color="#666" />
              <Text className="text-text-primary font-semibold mt-4">
                No products available
              </Text>
              <Text className="text-text-secondary text-sm mt-2">
                Check back later for new products
              </Text>
            </View>
          ) : (
            <ProductsGrid
              products={products}
              isLoading={isProductsLoading}
              isError={isProductsError}
            />
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ShopDetailScreen;
