import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useUser, useAuth } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";

const CATEGORIES = ["Electronics", "Accessories", "Fashion", "Sports", "Books", "Home", "Beauty", "Toys"];

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  images: Array<{
    uri: string;
    name: string;
    type: string;
  }>;
};

const defaultForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "Electronics",
  images: [],
};

export default function SellerProducts() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState<ProductForm>(defaultForm);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["seller-products", user?.id],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/products");
      return res.data as Product[];
    },
    enabled: !!user?.id,
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim() || !form.description.trim() || Number.isNaN(Number(form.price)) || Number.isNaN(Number(form.stock))) {
        throw new Error("Please complete all required fields with valid values.");
      }

      if (!editingProduct && form.images.length === 0) {
        throw new Error("Please upload at least one product image.");
      }

      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("description", form.description.trim());
      payload.append("price", form.price.trim());
      payload.append("stock", form.stock.trim());
      payload.append("category", form.category);

      form.images.slice(0, 3).forEach((file, index) => {
        payload.append("images", {
          uri: file.uri,
          name: file.name || `product-${index + 1}.jpg`,
          type: file.type || "image/jpeg",
        } as any);
      });

      // use fetch to POST/PATCH multipart so RN handles boundaries correctly
      const token = await getToken();
      const base = axiosInstance.defaults.baseURL;
      if (editingProduct?._id) {
        const res = await fetch(`${base}/seller/products/${editingProduct._id}`, {
          method: "PATCH",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: payload,
        });
        if (!res.ok) throw new Error("Failed to update product");
        return res.json();
      }

      const res = await fetch(`${base}/seller/products`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: payload,
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["seller-products", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["seller-dashboard-stats", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["seller-shop-stats", user?.id] }),
      ]);
      setModalVisible(false);
      setEditingProduct(null);
      setForm(defaultForm);
    },
    onError: (err: any) => {
      Alert.alert("Save failed", err?.response?.data?.message || err?.message || "Could not save product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axiosInstance.delete(`/seller/products/${id}`),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["seller-products", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["seller-dashboard-stats", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["seller-shop-stats", user?.id] }),
      ]);
    },
    onError: (err: any) => {
      Alert.alert("Delete failed", err?.response?.data?.message || "Could not delete product");
    },
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setModalVisible(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      category: product.category || "Electronics",
      images: [],
    });
    setModalVisible(true);
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo library access to upload product images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsMultipleSelection: true,
      quality: 0.9,
      selectionLimit: 3,
    });

    if (!result.canceled && result.assets.length > 0) {
      setForm((current) => ({
        ...current,
        images: [
          ...current.images,
          ...result.assets.map((asset, index) => {
            const fileName = asset.fileName || `product-${current.images.length + index + 1}.jpg`;
            const fileType = asset.mimeType || (fileName.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");
            return {
              uri: asset.uri,
              name: fileName,
              type: fileType,
            };
          }),
        ].slice(0, 3),
      }));
    }
  };

  const askDelete = (product: Product) => {
    Alert.alert("Delete product", `Delete ${product.name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(product._id) },
    ]);
  };

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
            <TouchableOpacity className="bg-surface/50 p-3 rounded-full" activeOpacity={0.7} onPress={openCreate}>
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
                    <TouchableOpacity className="flex-1 bg-surface/50 rounded-lg p-1.5 items-center" onPress={() => openEdit(item)}>
                      <Ionicons name="create-outline" size={14} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-surface/50 rounded-lg p-1.5 items-center" onPress={() => askDelete(item)}>
                      <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
            scrollIndicatorInsets={{ right: 1 }}
          />
        )}

        <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-surface rounded-t-3xl p-5 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-text-primary text-xl font-bold">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <TextInput
                value={form.name}
                onChangeText={(v) => setForm((prev) => ({ ...prev, name: v }))}
                placeholder="Product name"
                placeholderTextColor="#8a8a8a"
                className="bg-black/20 text-white rounded-xl px-4 py-3"
              />
              <TextInput
                value={form.description}
                onChangeText={(v) => setForm((prev) => ({ ...prev, description: v }))}
                placeholder="Description"
                placeholderTextColor="#8a8a8a"
                className="bg-black/20 text-white rounded-xl px-4 py-3"
                multiline
              />
              <View className="flex-row gap-2">
                <TextInput
                  value={form.price}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, price: v }))}
                  placeholder="Price"
                  placeholderTextColor="#8a8a8a"
                  keyboardType="decimal-pad"
                  className="flex-1 bg-black/20 text-white rounded-xl px-4 py-3"
                />
                <TextInput
                  value={form.stock}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, stock: v }))}
                  placeholder="Stock"
                  placeholderTextColor="#8a8a8a"
                  keyboardType="number-pad"
                  className="flex-1 bg-black/20 text-white rounded-xl px-4 py-3"
                />
              </View>

                <TouchableOpacity className="bg-black/20 rounded-xl p-4" onPress={pickImages}>
                  <View className="flex-row items-center justify-center gap-2">
                    <Ionicons name="image-outline" size={18} color="#fff" />
                    <Text className="text-text-primary font-semibold">
                      {editingProduct ? "Replace product images" : "Choose product images"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {editingProduct?.images?.length ? (
                  <View className="mt-2">
                    <Text className="text-text-secondary text-xs mb-2">Current images</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {editingProduct.images.slice(0, 3).map((uri) => (
                        <View key={uri} className="w-16 h-16 rounded-xl overflow-hidden bg-black/20">
                          <Image source={{ uri }} className="w-full h-full" />
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {form.images.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {form.images.map((file, index) => (
                      <View key={`${file.uri}-${index}`} className="w-16 h-16 rounded-xl overflow-hidden bg-black/20">
                        <Image source={{ uri: file.uri }} className="w-full h-full" />
                      </View>
                    ))}
                  </View>
                ) : null}

              <ScrollCategory
                value={form.category}
                onChange={(category) => setForm((prev) => ({ ...prev, category }))}
              />

              <TouchableOpacity
                onPress={() => upsertMutation.mutate()}
                disabled={upsertMutation.isPending}
                className="bg-green-600 rounded-xl py-3 items-center mt-1"
              >
                <Text className="text-white font-bold">
                  {upsertMutation.isPending ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeScreen>
  );
}

function ScrollCategory({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => onChange(category)}
          className={`px-3 py-2 rounded-full ${value === category ? "bg-green-600" : "bg-black/20"}`}
        >
          <Text className={value === category ? "text-white font-semibold" : "text-text-secondary"}>{category}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
