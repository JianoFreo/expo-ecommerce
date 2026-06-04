import React, { useEffect, useState } from "react";
import axios from "../shared";

type Stats = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalShops: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    axios
      .get("/admin/stats")
      .then((res) => setStats(res.data || res.data?.stats || null))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-base-200 rounded">
          <div className="text-sm text-muted">Total Products</div>
          <div className="text-2xl font-bold">{stats?.totalProducts ?? "—"}</div>
        </div>
        <div className="p-4 bg-base-200 rounded">
          <div className="text-sm text-muted">Total Orders</div>
          <div className="text-2xl font-bold">{stats?.totalOrders ?? "—"}</div>
        </div>
        <div className="p-4 bg-base-200 rounded">
          <div className="text-sm text-muted">Total Revenue</div>
          <div className="text-2xl font-bold">${Number(stats?.totalRevenue || 0).toFixed(2)}</div>
        </div>
        <div className="p-4 bg-base-200 rounded">
          <div className="text-sm text-muted">Total Users</div>
          <div className="text-2xl font-bold">{stats?.totalUsers ?? "—"}</div>
        </div>
        <div className="p-4 bg-base-200 rounded">
          <div className="text-sm text-muted">Total Shops</div>
          <div className="text-2xl font-bold">{stats?.totalShops ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}
