import React, { useEffect, useState } from "react";
import axios from "../../../shared";
import type { Order } from "../../../shared";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    axios
      .get("/orders")
      .then((res) => setOrders(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <ul className="mt-4 space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="p-3 border rounded">
            <div className="font-semibold">Order {o.id}</div>
            <div className="text-sm">Total: ${o.total}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
