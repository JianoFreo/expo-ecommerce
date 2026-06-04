import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { statsApi } from "../lib/api";
import { formatMoney } from "../lib/format";
import { queryKeys } from "../lib/queryKeys";
import type { DashboardStats } from "../shared/types";

const quickActions = [
  { label: "Products", href: "/products", color: "from-rose-500 to-orange-400" },
  { label: "Orders", href: "/orders", color: "from-sky-500 to-cyan-400" },
  { label: "Users", href: "/users", color: "from-violet-500 to-fuchsia-400" },
  { label: "Shops", href: "/shops", color: "from-emerald-500 to-lime-400" },
];

const statCards: { key: keyof DashboardStats; label: string; accent: string }[] = [
  { key: "totalProducts", label: "Total Products", accent: "text-rose-600" },
  { key: "totalOrders", label: "Total Orders", accent: "text-sky-600" },
  { key: "totalCustomers", label: "Total Customers", accent: "text-violet-600" },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => statsApi.dashboard(),
  });

  const formattedRevenue = useMemo(
    () => formatMoney(stats?.totalRevenue ?? 0),
    [stats?.totalRevenue],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-[#ff6b6b] via-[#ff8f4c] to-[#ffb347] p-6 text-white shadow-[0_20px_60px_rgba(255,120,64,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Super Admin</p>
            <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">Platform Management</h1>
            <p className="mt-2 max-w-xl text-sm text-white/85">
              API-driven dashboard — stats and catalog sync from the shared backend in real time.
            </p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
            ⚡
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.key} className="rounded-[24px] border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className={`mt-3 text-3xl font-black ${card.accent}`}>
              {isLoading ? "…" : (stats?.[card.key] ?? 0)}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[24px] border border-white/10 bg-[#111318] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Revenue</h2>
            <p className="text-sm text-white/60">From GET /admin/stats</p>
          </div>
          <div className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300">
            {formattedRevenue}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className={`rounded-[24px] bg-gradient-to-br ${action.color} p-5 text-white shadow-lg shadow-black/10 transition-transform active:scale-[0.98]`}
          >
            <p className="text-sm font-medium text-white/85">Open</p>
            <p className="mt-6 text-xl font-black">{action.label}</p>
          </a>
        ))}
      </section>
    </div>
  );
}
