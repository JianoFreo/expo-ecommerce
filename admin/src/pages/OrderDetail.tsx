import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../shared";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/admin/orders/${id}`)
      .then((res) => setOrder(res.data?.order || res.data))
      .catch(() => {});
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await axios.patch(`/admin/orders/${id}/status`, { status });
      const res = await axios.get(`/admin/orders/${id}`);
      setOrder(res.data?.order || res.data);
    } catch (e) {}
  };

  if (!order) return <div>Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order #{String(order._id || order.id).slice(-6)}</h1>
        <button className="btn" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="mt-4 p-4 border rounded">
        <div className="mb-2">Buyer: {order.user?.name || order.userId}</div>
        <div className="mb-2">Total: ${Number(order.total || order.totalPrice || 0).toFixed(2)}</div>
        <div className="mb-2">Status: <strong>{order.status}</strong></div>

        <div className="mt-3 flex gap-2">
          <button className="btn btn-sm" onClick={() => updateStatus("processing")}>Set Processing</button>
          <button className="btn btn-sm" onClick={() => updateStatus("shipped")}>Set Shipped</button>
          <button className="btn btn-sm" onClick={() => updateStatus("delivered")}>Set Delivered</button>
        </div>
      </div>
    </div>
  );
}
