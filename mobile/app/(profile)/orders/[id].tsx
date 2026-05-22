import { useLocalSearchParams } from "expo-router";
import OrderDetailsView from "@/components/OrderDetailsView";

export default function BuyerOrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <OrderDetailsView
      orderId={id}
      endpoint={`/orders/${id}`}
      title="Order Invoice"
      subtitle="Your receipt and order details"
    />
  );
}
