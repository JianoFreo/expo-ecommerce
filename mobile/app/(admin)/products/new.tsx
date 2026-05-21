import SafeScreen from "@/components/SafeScreen";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image as RNImage } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useApi } from "@/lib/api";
import { useRouter } from "expo-router";

const CATEGORY_OPTIONS = ["electronics", "fashion", "home", "beauty", "sports"];

export default function NewProduct() {
  const api = useApi();
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([] as string[]);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!res.cancelled) {
      setImages((s) => [...s, res.uri]);
    }
  };

  const submit = async () => {
    if (!name || !price) return;
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append("name", name);
      form.append("price", String(parseFloat(price)));
      form.append("category", category);
      form.append("description", description);

      images.forEach((uri, idx) => {
        const filename = uri.split("/").pop() || `image-${idx}.jpg`;
        const match = filename.match(/\.(\w+)$/);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore - RN FormData file
        form.append("images", { uri, name: filename, type });
      });

      await api.post("/admin/products", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.back();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen>
      <ScrollView className="p-6">
        <Text className="text-2xl font-bold mb-2">Create product</Text>

        <Text className="text-sm text-text-secondary">Name</Text>
        <TextInput value={name} onChangeText={setName} className="bg-surface rounded-xl p-3 mb-3" />

        <Text className="text-sm text-text-secondary">Price</Text>
        <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" className="bg-surface rounded-xl p-3 mb-3" />

        <Text className="text-sm text-text-secondary">Category</Text>
        <View className="flex-row gap-2 mb-3">
          {CATEGORY_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt} onPress={() => setCategory(opt)} className={`px-3 py-2 rounded-full ${category === opt ? 'bg-primary' : 'bg-surface'}`}>
              <Text className={`${category === opt ? 'text-white' : 'text-text-primary'}`}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm text-text-secondary">Description</Text>
        <TextInput value={description} onChangeText={setDescription} multiline numberOfLines={4} className="bg-surface rounded-xl p-3 mb-3" />

        <Text className="text-sm text-text-secondary mb-2">Images</Text>
        <View className="flex-row gap-2 mb-4">
          {images.map((uri, i) => (
            <RNImage key={i} source={{ uri }} style={{ width: 72, height: 72, borderRadius: 12 }} />
          ))}
          <TouchableOpacity onPress={pickImage} className="bg-surface rounded-xl w-18 h-18 items-center justify-center">
            <Text className="text-primary font-bold">Add</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity disabled={submitting} onPress={submit} className="bg-primary rounded-xl py-3 items-center">
          {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Create</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}
