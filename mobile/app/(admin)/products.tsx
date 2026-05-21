import SafeScreen from "@/components/SafeScreen";
import { useProducts } from "@/hooks/useProducts";
import { Image } from "expo-image";
import { Text, View, ScrollView } from "react-native";

export default function AdminProducts() {
  const { data: products } = useProducts();

  return (
    <SafeScreen>
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold text-text-primary mb-2">Products</Text>
        <Text className="text-text-secondary mb-6">All catalog items visible in the web admin.</Text>

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
