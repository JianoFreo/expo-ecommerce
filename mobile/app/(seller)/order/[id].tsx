import { useLocalSearchParams } from "expo-router";
import OrderDetailsView from "@/components/OrderDetailsView";

export default function SellerOrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <OrderDetailsView
      orderId={id}
      endpoint={`/seller/orders/${id}`}
      title="Order Details"
      subtitle="Seller invoice and fulfillment details"
    />
  );
}