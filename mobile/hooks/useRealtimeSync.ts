import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/axios";

let socket: Socket | null = null;

function getSocketUrl() {
  const base = API_BASE_URL || "";
  return base.replace(/\/api\/?$/, "");
}

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const url = getSocketUrl();
    if (!url) return;

    socket = io(url, { transports: ["websocket", "polling"] });
    socket.emit("subscribe", ["products", "orders"]);

    const onProduct = () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
    };

    const onOrder = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    };

    socket.on("catalog:product", onProduct);
    socket.on("orders:changed", onOrder);

    return () => {
      socket?.off("catalog:product", onProduct);
      socket?.off("orders:changed", onOrder);
      socket?.disconnect();
      socket = null;
    };
  }, [queryClient]);
}
