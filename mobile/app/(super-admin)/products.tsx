import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Image as RNImage,
} from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useUser } from "@clerk/clerk-expo";

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

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "Electronics",
  images: [],
};

export default function AdminProducts() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [visible, setVisible] = React.useState(false);
  const [form, setForm] = React.useState<ProductForm>(emptyForm);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/products");
      return (res.data?.products || []) as Product[];
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim() || !form.description.trim() || !form.price.trim() || !form.stock.trim()) {
        throw new Error("Please fill in all required fields.");
      }
      if (form.images.length === 0) {
        throw new Error("Please add at least one product image.");
      }

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price.trim());
      fd.append("stock", form.stock.trim());
      fd.append("category", form.category);
      form.images.slice(0, 3).forEach((file, index) => {
        const fileName = file.name || `product-${index + 1}.jpg`;
        const mimeType = file.type || (fileName.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");
        fd.append("images", {
          uri: file.uri,
          name: fileName,
          type: mimeType,
        } as any);
      });

      return axiosInstance.post("/admin/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setVisible(false);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      Alert.alert("Create failed", err?.response?.data?.message || err?.message || "Could not create product");
    },
  });

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
            const uri = asset.uri;
            const name = asset.fileName || `product-${current.images.length + index + 1}.jpg`;
            const type = asset.mimeType || (name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");
            return { uri, name, type };
          }),
        ].slice(0, 3),
      }));
    }
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

  return (
    <SafeScreen>
      <View className="flex-1">
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-text-primary text-3xl font-bold tracking-tight">Products</Text>
            <Text className="text-text-secondary text-sm mt-1">Manage platform products</Text>
          </View>
          <TouchableOpacity className="bg-surface/50 p-3 rounded-full" activeOpacity={0.7} onPress={() => setVisible(true)}>
            <Ionicons name="add-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Products List */}
        <FlatList
          data={products || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-surface mx-6 my-2 rounded-2xl p-4 flex-row gap-4">
              <View className="w-20 h-20 bg-black/20 rounded-xl overflow-hidden items-center justify-center">
                {item.images?.[0] ? (
                  <Image source={{ uri: item.images[0] }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                ) : (
                  <Ionicons name="cube-outline" size={28} color="#666" />
                )}
              </View>
              <View className="flex-1 justify-center">
                <Text className="font-semibold text-text-primary">{item.name}</Text>
                <Text className="text-text-secondary text-sm">{item.shop?.name}</Text>
                <Text className="text-red-500 font-bold mt-1">${item.price}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 100 }}
        />

        <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-surface rounded-t-3xl p-5 gap-3 max-h-[90%]">
              <View className="flex-row items-center justify-between">
                <Text className="text-text-primary text-xl font-bold">Create Product</Text>
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <TextInput
                  value={form.name}
                  onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
                  placeholder="Product name"
                  placeholderTextColor="#8a8a8a"
                  className="bg-black/20 text-white rounded-xl px-4 py-3 mb-3"
                />
                <TextInput
                  value={form.description}
                  onChangeText={(value) => setForm((current) => ({ ...current, description: value }))}
                  placeholder="Description"
                  placeholderTextColor="#8a8a8a"
                  multiline
                  className="bg-black/20 text-white rounded-xl px-4 py-3 mb-3 min-h-24"
                />
                <View className="flex-row gap-2 mb-3">
                  <TextInput
                    value={form.price}
                    onChangeText={(value) => setForm((current) => ({ ...current, price: value }))}
                    placeholder="Price"
                    placeholderTextColor="#8a8a8a"
                    keyboardType="decimal-pad"
                    className="flex-1 bg-black/20 text-white rounded-xl px-4 py-3"
                  />
                  <TextInput
                    value={form.stock}
                    onChangeText={(value) => setForm((current) => ({ ...current, stock: value }))}
                    placeholder="Stock"
                    placeholderTextColor="#8a8a8a"
                    keyboardType="number-pad"
                    className="flex-1 bg-black/20 text-white rounded-xl px-4 py-3"
                  />
                </View>

                <View className="flex-row flex-wrap gap-2 mb-3">
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => setForm((current) => ({ ...current, category }))}
                      className={`px-3 py-2 rounded-full ${form.category === category ? "bg-red-500" : "bg-black/20"}`}
                    >
                      <Text className={form.category === category ? "text-white font-semibold" : "text-text-secondary"}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity className="bg-black/20 rounded-xl p-4 mb-3" onPress={pickImages}>
                  <View className="flex-row items-center justify-center gap-2">
                    <Ionicons name="image-outline" size={18} color="#fff" />
                    <Text className="text-text-primary font-semibold">Choose images</Text>
                  </View>
                </TouchableOpacity>

                {form.images.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {form.images.map((file, index) => (
                      <View key={`${file.uri}-${index}`} className="w-20 h-20 rounded-xl overflow-hidden bg-black/20">
                        <RNImage source={{ uri: file.uri }} style={{ width: "100%", height: "100%" }} />
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  className="bg-red-500 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-bold">
                    {createMutation.isPending ? "Creating..." : "Create Product"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeScreen>
  );
}
