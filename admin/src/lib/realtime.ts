import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "../shared";
import type { RealtimePayload, Product, Order } from "../shared/types";

export const REALTIME_CHANNELS = ["products", "orders"] as const;

export type CatalogEvent = RealtimePayload<Product>;
export type OrderEvent = RealtimePayload<Order>;

let socket: Socket | null = null;

export function getSocketOrigin(): string {
  return API_BASE_URL.replace(/\/api\/?$/, "") || "http://localhost:3000";
}

export function connectRealtime(): Socket {
  if (socket?.connected) return socket;

  socket = io(getSocketOrigin(), {
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    socket?.emit("subscribe", [...REALTIME_CHANNELS]);
  });

  return socket;
}

export function disconnectRealtime(): void {
  socket?.disconnect();
  socket = null;
}

export function onCatalogChange(handler: (payload: CatalogEvent) => void): () => void {
  const client = connectRealtime();
  client.on("catalog:product", handler);
  return () => client.off("catalog:product", handler);
}

export function onOrdersChange(handler: (payload: OrderEvent) => void): () => void {
  const client = connectRealtime();
  client.on("orders:changed", handler);
  return () => client.off("orders:changed", handler);
}
