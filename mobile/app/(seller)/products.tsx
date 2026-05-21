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
import axiosInstance from "@/lib/axios";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";

const CATEGORIES = ["Electronics", "Accessories", "Fashion", "Sports", "Books", "Home", "Beauty", "Toys"];

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
};

const defaultForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "Electronics",
  imageUrl: "",
};

export default function SellerProducts() {
  const { user } = useUser();
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
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
      };

      if (!payload.name || !payload.description || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
        throw new Error("Please complete all required fields with valid values.");
      }

      if (editingProduct?._id) {
        return axiosInstance.patch(`/seller/products/${editingProduct._id}`, payload);
      }
      return axiosInstance.post("/seller/products", payload);
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
      imageUrl: product.images?.[0] || "",
    });
    setModalVisible(true);
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
              <TextInput
                value={form.imageUrl}
                onChangeText={(v) => setForm((prev) => ({ ...prev, imageUrl: v }))}
                placeholder="Image URL (optional)"
                placeholderTextColor="#8a8a8a"
                className="bg-black/20 text-white rounded-xl px-4 py-3"
              />

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
