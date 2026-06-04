import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../lib/api";
import type { Order } from "../shared/types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    orderApi
      .getAll()
      .then((res) => setOrders(res?.orders || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="mt-4 space-y-2">
        {orders.map((o) => (
          <Link key={o._id} to={`/orders/${o._id}`} className="block p-3 border rounded hover:bg-base-200">
            <div className="flex justify-between items-center">
              <div className="font-semibold">#{o._id}</div>
              <div className="text-sm">Total: ${o.totalPrice.toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
