import React, { useEffect, useState } from "react";
import axios from "../shared";
import { Link } from "react-router-dom";

export default function Seller() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axios
      .get("/seller/stats")
      .then((res) => setStats(res.data || res.data?.stats || null))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Seller Dashboard</h1>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-base-200 rounded">
          <div className="text-sm text-muted">Your Products</div>
          <div className="text-2xl font-bold">{stats?.products ?? "—"}</div>
        </div>
        <div className="p-4 bg-base-200 rounded">
          <div className="text-sm text-muted">Your Orders</div>
          <div className="text-2xl font-bold">{stats?.orders ?? "—"}</div>
        </div>
        <div className="p-4 bg-base-200 rounded">
          <div className="text-sm text-muted">Total Revenue</div>
          <div className="text-2xl font-bold">${Number(stats?.revenue || 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/products" className="btn mr-2">Manage Products</Link>
        <Link to="/orders" className="btn">View Orders</Link>
      </div>
    </div>
  );
}
