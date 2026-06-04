import React from "react";

export default function Navbar() {
  return (
    <header className="w-full bg-white shadow px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-lg font-bold">Expo E‑Commerce Admin</div>
        <div>
          <button className="btn btn-ghost">Sign out</button>
        </div>
      </div>
    </header>
  );
}
