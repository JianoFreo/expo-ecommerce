import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../lib/api";
import { formatMoney, getOrderStatusBadge } from "../lib/format";
import { queryKeys } from "../lib/queryKeys";
import type { OrderStatus } from "../shared/types";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: queryKeys.order(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Missing order id");
      const res = await orderApi.getById(id);
      return res.order;
    },
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: (status: OrderStatus) => {
      if (!id) throw new Error("Missing order id");
      return orderApi.updateStatus(id, status);
    },
    onSuccess: (res) => {
      if (!id) return;
      queryClient.setQueryData(queryKeys.order(id), res.order);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });

  if (isLoading || !order) return <div>Loading…</div>;

  const buyerName =
    typeof order.user === "object" && order.user !== null
      ? order.user.name || order.user.email
      : String(order.user);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order #{order._id.slice(-6)}</h1>
        <button type="button" className="btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="mt-4 rounded border p-4">
        <div className="mb-2">Buyer: {buyerName}</div>
        <div className="mb-2">Total: {formatMoney(order.totalPrice)}</div>
        <div className="mb-2 flex items-center gap-2">
          Status:
          <span className={`badge ${getOrderStatusBadge(order.status)}`}>{order.status}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              className="btn btn-sm"
              disabled={order.status === status || updateMutation.isPending}
              onClick={() => updateMutation.mutate(status)}
            >
              Set {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
