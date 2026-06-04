import React from "react";
import { NavLink } from "react-router-dom";

type RoleView = "buyer" | "seller" | "super-admin";

const LinkItem = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `${isActive ? "bg-slate-900 text-white shadow-lg shadow-black/10" : "text-slate-600 hover:bg-slate-100"} block rounded-2xl px-4 py-3 text-sm font-semibold transition`
    }
  >
    {children}
  </NavLink>
);

export default function Sidebar({ role }: { role: RoleView }) {
  const showSellerView = role === "seller" || role === "super-admin";
  const showAdminView = role === "super-admin";

  return (
    <aside className="hidden w-72 border-r border-white/10 bg-[#0f1115] px-4 py-5 md:block">
      <nav className="space-y-2">
        <LinkItem to="/buyer">Buyer Home</LinkItem>
        {showSellerView ? <LinkItem to="/seller">Seller Dashboard</LinkItem> : null}
        {showAdminView ? <LinkItem to="/dashboard">Super Admin</LinkItem> : null}
        {showAdminView ? <LinkItem to="/products">Products</LinkItem> : null}
        {showAdminView ? <LinkItem to="/orders">Orders</LinkItem> : null}
        {showAdminView ? <LinkItem to="/users">Users</LinkItem> : null}
        {showAdminView ? <LinkItem to="/shops">Shops</LinkItem> : null}
        {showAdminView ? <LinkItem to="/banner">Banner</LinkItem> : null}
        {showAdminView ? <LinkItem to="/reviews">Reviews</LinkItem> : null}
        {showAdminView ? <LinkItem to="/settings">Settings</LinkItem> : null}
      </nav>
    </aside>
  );
}
