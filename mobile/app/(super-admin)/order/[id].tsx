import { useLocalSearchParams } from "expo-router";
import OrderDetailsView from "@/components/OrderDetailsView";

export default function SuperAdminOrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <OrderDetailsView
      orderId={id}
      endpoint={`/admin/orders/${id}`}
      title="Order Details"
      subtitle="Platform invoice and buyer details"
    />
  );
}