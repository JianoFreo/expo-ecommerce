import SafeScreen from "@/components/SafeScreen";
import { useOrders } from "@/hooks/useOrders";
import { Text, View, ScrollView } from "react-native";

export default function AdminOrders() {
  const { data: orders } = useOrders();

  return (
    <SafeScreen>
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold text-text-primary mb-2">Orders</Text>
        <Text className="text-text-secondary mb-6">All order records shown in the web admin.</Text>

        {(orders || []).map((order) => (
          <View key={order._id} className="bg-surface rounded-3xl p-4 mb-4">
            <Text className="text-text-primary font-bold">Order #{order._id.slice(-6)}</Text>
            <Text className="text-text-secondary text-sm mt-1">Status: {order.status}</Text>
            <Text className="text-text-secondary text-sm">Total: ${order.totalPrice.toFixed(2)}</Text>
            <Text className="text-text-secondary text-sm">Items: {order.orderItems.length}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}
