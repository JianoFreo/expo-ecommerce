import SafeScreen from "@/components/SafeScreen";
import { useApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

export default function AdminBanner() {
  const api = useApi();

  const { data } = useQuery({
    queryKey: ["homeBanner"],
    queryFn: async () => {
      const { data } = await api.get("/banner");
      return data.banner;
    },
  });

  return (
    <SafeScreen>
      <View className="flex-1 p-6">
        <Text className="text-3xl font-bold text-text-primary mb-2">Banner</Text>
        <Text className="text-text-secondary mb-6">Home banner data shared with the web admin.</Text>

        <View className="bg-surface rounded-3xl p-4">
          <Text className="text-text-primary font-bold">{data?.badgeText || "Best Deals"}</Text>
          <Text className="text-text-secondary mt-1">CTA: {data?.ctaText || "Shop Now"}</Text>
          <Text className="text-text-secondary mt-1">Active: {data?.isActive ? "Yes" : "No"}</Text>
          <Text className="text-text-secondary mt-1">Product: {data?.product?.name || "None"}</Text>
        </View>
      </View>
    </SafeScreen>
  );
}
