import React from "react";
import { SignOutButton, UserButton, useAuth } from "@clerk/clerk-react";

type RoleView = "buyer" | "seller" | "super-admin";

export default function Navbar({ role, onSwitchRole }: { role: RoleView; onSwitchRole: (role: RoleView) => void }) {
  const { isSignedIn } = useAuth();
  const canSwitchToSeller = role === "seller" || role === "super-admin";
  const canSwitchToAdmin = role === "super-admin";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Admin</div>
          <div className="text-lg font-black text-slate-900">Expo E-Commerce</div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 p-1 md:flex">
            <button onClick={() => onSwitchRole("buyer")} className={`rounded-full px-3 py-2 text-xs font-semibold ${role === "buyer" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>
              Buyer
            </button>
            {canSwitchToSeller ? (
              <button onClick={() => onSwitchRole("seller")} className={`rounded-full px-3 py-2 text-xs font-semibold ${role === "seller" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>
                Seller
              </button>
            ) : null}
            {canSwitchToAdmin ? (
              <button onClick={() => onSwitchRole("super-admin")} className={`rounded-full px-3 py-2 text-xs font-semibold ${role === "super-admin" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>
                Admin
              </button>
            ) : null}
          </div>
          {isSignedIn ? (
            <>
              <UserButton />
              <SignOutButton>
                <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Sign out</button>
              </SignOutButton>
            </>
          ) : (
            <div />
          )}
        </div>
      </div>
    </header>
  );
}
