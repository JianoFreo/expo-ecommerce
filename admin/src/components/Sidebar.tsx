import React from "react";
import { NavLink } from "react-router-dom";

const LinkItem = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <NavLink to={to} className={({ isActive }) => (isActive ? "font-semibold" : "") + " block py-2 px-3 rounded hover:bg-base-200"}>
    {children}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="w-64 p-4 border-r hidden md:block">
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
