import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderApi, unwrapOrders } from "../lib/api";
import { formatMoney, getOrderStatusBadge } from "../lib/format";
import { queryKeys } from "../lib/queryKeys";

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: queryKeys.orders,
    queryFn: async () => unwrapOrders(await orderApi.list()),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      {isLoading ? (
        <div className="mt-4 text-sm text-muted">Loading…</div>
      ) : (
        <div className="mt-4 space-y-2">
          {orders.length === 0 ? (
            <div className="text-sm text-muted">No orders yet</div>
          ) : (
            orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block rounded border p-3 hover:bg-base-200"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">#{order._id.slice(-6)}</div>
                  <div className="flex items-center gap-2">
                    <span className={`badge badge-sm ${getOrderStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-sm">{formatMoney(order.totalPrice)}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
