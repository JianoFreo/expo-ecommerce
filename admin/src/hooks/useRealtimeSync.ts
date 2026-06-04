import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectRealtime, disconnectRealtime, onCatalogChange, onOrdersChange } from "../lib/realtime";
import { queryKeys } from "../lib/queryKeys";
import type { Order, Product } from "../shared/types";

function upsertProduct(list: Product[], next: Product): Product[] {
  const index = list.findIndex((item) => item._id === next._id);
  if (index === -1) return [next, ...list];
  const copy = [...list];
  copy[index] = next;
  return copy;
}

function removeProduct(list: Product[], id: string): Product[] {
  return list.filter((item) => item._id !== id);
}

function upsertOrder(list: Order[], next: Order): Order[] {
  const index = list.findIndex((item) => item._id === next._id);
  if (index === -1) return [next, ...list];
  const copy = [...list];
  copy[index] = next;
  return copy;
}

/** Subscribe to backend Socket.io channels and sync React Query caches. */
export function useRealtimeSync(enabled = true): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    connectRealtime();

    const offCatalog = onCatalogChange((payload) => {
      const product = payload.data;
      if (!product?._id) return;

      queryClient.setQueriesData<Product[]>(
        { queryKey: ["products"] },
        (current) => {
          if (!current) return current;
          if (payload.action === "deleted") return removeProduct(current, product._id);
          return upsertProduct(current, product);
        },
      );

      queryClient.setQueryData(queryKeys.product(product._id), product);
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    });

    const offOrders = onOrdersChange((payload) => {
      const order = payload.data;
      if (!order?._id) return;

      queryClient.setQueriesData<Order[]>(
        { queryKey: ["orders"] },
        (current) => {
          if (!current) return current;
          return upsertOrder(current, order);
        },
      );

      queryClient.setQueryData(queryKeys.order(order._id), order);
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    });

    return () => {
      offCatalog();
      offOrders();
      disconnectRealtime();
    };
  }, [enabled, queryClient]);
}
