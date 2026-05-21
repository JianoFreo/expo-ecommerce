import SafeScreen from "@/components/SafeScreen";
import { useApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Text, View, ScrollView } from "react-native";

export default function AdminShops() {
  const api = useApi();

  const { data } = useQuery({
    queryKey: ["adminShops"],
    queryFn: async () => {
      const { data } = await api.get("/admin/shops");
      return data.shops;
    },
  });

  return (
    <SafeScreen>
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold text-text-primary mb-2">Shops</Text>
        <Text className="text-text-secondary mb-6">Same shops data as the web admin.</Text>

        {(data || []).map((shop) => (
          <View key={shop._id} className="bg-surface rounded-3xl p-4 mb-4">
            <Text className="text-text-primary font-bold text-lg">{shop.name}</Text>
            <Text className="text-text-secondary text-sm mt-1">{shop.description || "No description"}</Text>
            <Text className="text-text-secondary text-xs mt-2">Owner: {shop.owner?.name || "Unknown"}</Text>
            <Text className="text-text-secondary text-xs">Products: {shop.productCount ?? 0}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}
