import React from "react";
import { SignOutButton, UserButton, useAuth } from "@clerk/clerk-react";

type RoleView = "buyer" | "seller" | "super-admin";

export default function Navbar({ role, onSwitchRole }: { role: RoleView; onSwitchRole: (role: RoleView) => void }) {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#0b0d10]/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src="/brand-logo.svg" alt="JianoFreo Marketplace" className="h-10 w-auto object-contain" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">Marketplace</div>
            <div className="text-lg font-black text-white">JianoFreo</div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80">{role === "super-admin" ? "Super Admin" : role === "seller" ? "Seller Mode" : "Buyer Mode"}</span>
          {isSignedIn ? (
            <>
              <UserButton />
              <SignOutButton>
                <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">Sign out</button>
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
