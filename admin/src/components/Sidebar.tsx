import React from "react";
import { NavLink } from "react-router-dom";

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

export default function Sidebar() {
  return (
    <aside className="hidden w-72 border-r border-black/5 bg-white px-4 py-5 md:block">
      <nav className="space-y-2">
        <LinkItem to="/dashboard">Dashboard</LinkItem>
        <LinkItem to="/products">Products</LinkItem>
        <LinkItem to="/orders">Orders</LinkItem>
        <LinkItem to="/users">Users</LinkItem>
        <LinkItem to="/shops">Shops</LinkItem>
        <LinkItem to="/banner">Banner</LinkItem>
        <LinkItem to="/seller">Seller Dashboard</LinkItem>
        <LinkItem to="/reviews">Reviews</LinkItem>
      </nav>
    </aside>
  );
}
