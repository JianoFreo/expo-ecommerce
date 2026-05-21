import SafeScreen from "@/components/SafeScreen";
import { useApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, ScrollView } from "react-native";

export default function AdminDashboard() {
  const api = useApi();

  const { data } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
  });

  const cards = [
    { label: "Revenue", value: `$${Number(data?.totalRevenue || 0).toFixed(2)}`, icon: "cash" },
    { label: "Orders", value: data?.totalOrders || 0, icon: "cart" },
    { label: "Customers", value: data?.totalCustomers || 0, icon: "people" },
    { label: "Products", value: data?.totalProducts || 0, icon: "cube" },
  ];

  return (
    <SafeScreen>
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold text-text-primary mb-2">Admin Dashboard</Text>
        <Text className="text-text-secondary mb-6">Same data source as the web admin.</Text>

        <View className="flex-row flex-wrap gap-3">
          {cards.map((card) => (
            <View key={card.label} className="w-[48%] bg-surface rounded-3xl p-4 mb-3">
              <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mb-4">
                <Ionicons name={card.icon as any} size={18} color="#1DB954" />
              </View>
              <Text className="text-text-secondary text-sm">{card.label}</Text>
              <Text className="text-text-primary text-2xl font-bold mt-1">{card.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
