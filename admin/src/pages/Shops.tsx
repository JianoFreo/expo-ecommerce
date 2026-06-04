import React from "react";
import { useQuery } from "@tanstack/react-query";
import { shopApi, unwrapShops } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import type { Shop, UserSummary } from "../shared/types";

function ownerLabel(owner: Shop["owner"]): string {
  if (typeof owner === "object" && owner !== null) {
    return (owner as UserSummary).name || (owner as UserSummary).email || "—";
  }
  return String(owner);
}

export default function Shops() {
  const { data: shops = [], isLoading } = useQuery({
    queryKey: queryKeys.shops,
    queryFn: async () => unwrapShops(await shopApi.listAdmin()),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Shops</h1>
      {isLoading ? (
        <div className="mt-4 text-sm text-muted">Loading…</div>
      ) : (
        <div className="mt-4 space-y-3">
          {shops.map((shop) => (
            <div key={shop._id} className="flex items-center justify-between rounded border p-4">
              <div>
                <div className="font-semibold">{shop.name}</div>
                <div className="text-sm text-muted">Owner: {ownerLabel(shop.owner)}</div>
                {typeof shop.productCount === "number" ? (
                  <div className="text-xs text-muted">{shop.productCount} products</div>
                ) : null}
              </div>
              <div className="text-sm">{shop.isActive ? "Active" : "Inactive"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
