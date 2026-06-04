import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../shared";
import type { Order } from "../shared/types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    axios
      .get("/admin/orders")
      .then((res) => setOrders(res.data?.orders || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="mt-4 space-y-2">
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="block p-3 border rounded hover:bg-base-200">
            <div className="flex justify-between items-center">
              <div className="font-semibold">#{o.id}</div>
              <div className="text-sm">Total: ${o.total.toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
