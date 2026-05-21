import SafeScreen from "@/components/SafeScreen";
import { useProducts } from "@/hooks/useProducts";
import { Image } from "expo-image";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function AdminProducts() {
  const { data: products } = useProducts();
  const router = useRouter();

  return (
    <SafeScreen>
      <ScrollView className="flex-1 p-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-text-primary">Products</Text>
            <Text className="text-text-secondary">All catalog items visible in the web admin.</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/products/new')}
            className="bg-primary px-4 py-2 rounded-full"
          >
            <Text className="text-white font-bold">New</Text>
          </TouchableOpacity>
        </View>

        {(products || []).map((product) => (
          <View key={product._id} className="bg-surface rounded-3xl p-4 mb-4 flex-row gap-4">
            <Image source={product.images?.[0]} style={{ width: 72, height: 72, borderRadius: 18 }} contentFit="cover" />
            <View className="flex-1">
              <Text className="text-text-primary font-bold text-lg" numberOfLines={1}>{product.name}</Text>
              <Text className="text-text-secondary text-sm" numberOfLines={2}>{product.description}</Text>
              <View className="flex-row justify-between mt-2">
                <Text className="text-primary font-bold">${product.price.toFixed(2)}</Text>
                <Text className="text-text-secondary">{product.category}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}
