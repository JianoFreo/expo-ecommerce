import React, { useEffect, useMemo, useState } from "react";
import axios from "../shared";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalShops: number;
}

const quickActions = [
  { label: "Products", href: "/products", color: "from-rose-500 to-orange-400" },
  { label: "Orders", href: "/orders", color: "from-sky-500 to-cyan-400" },
  { label: "Users", href: "/users", color: "from-violet-500 to-fuchsia-400" },
  { label: "Shops", href: "/shops", color: "from-emerald-500 to-lime-400" },
];

const statCards = [
  { key: "totalProducts", label: "Total Products", accent: "text-rose-600" },
  { key: "totalOrders", label: "Total Orders", accent: "text-sky-600" },
  { key: "totalUsers", label: "Total Users", accent: "text-violet-600" },
  { key: "totalShops", label: "Total Shops", accent: "text-emerald-600" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    axios
      .get("/admin/stats")
      .then((res) => {
        if (!alive) return;
        setStats(res.data?.stats || res.data || null);
      })
      .catch(() => {
        if (!alive) return;
        setStats(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const formattedRevenue = useMemo(() => Number(stats?.totalRevenue || 0).toFixed(2), [stats]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-[#ff6b6b] via-[#ff8f4c] to-[#ffb347] p-6 text-white shadow-[0_20px_60px_rgba(255,120,64,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Super Admin</p>
            <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">Platform Management</h1>
            <p className="mt-2 max-w-xl text-sm text-white/85">Monitor products, orders, users, and shops with a layout that mirrors the mobile admin experience.</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
            ⚡
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.key} className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className={`mt-3 text-3xl font-black ${card.accent}`}>{loading ? "…" : (stats?.[card.key as keyof DashboardStats] ?? 0)}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[24px] border border-white/10 bg-[#111318] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Revenue</h2>
            <p className="text-sm text-white/60">Latest platform earnings</p>
          </div>
          <div className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300">
            ${formattedRevenue}
          </div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-white/10">
          <div className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-lime-400 to-amber-400" style={{ width: "72%" }} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map((action) => (
          <a key={action.label} href={action.href} className={`rounded-[24px] bg-gradient-to-br ${action.color} p-5 text-white shadow-lg shadow-black/10 transition-transform active:scale-[0.98]`}>
            <p className="text-sm font-medium text-white/85">Open</p>
            <p className="mt-6 text-xl font-black">{action.label}</p>
          </a>
        ))}
      </section>

      <section className="rounded-[24px] border border-white/10 bg-[#111318] p-5 shadow-sm">
        <h2 className="text-lg font-bold text-white">Admin Notes</h2>
        <div className="mt-4 space-y-3 text-sm text-white/60">
          <p>Use the Products page for image uploads and edits.</p>
          <p>Use the Orders page to inspect order details and status changes.</p>
          <p>Use the Reviews page to moderate product reviews.</p>
        </div>
      </section>
    </div>
  );
}
