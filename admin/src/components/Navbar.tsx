import React from "react";
import { SignOutButton, UserButton, useAuth } from "@clerk/clerk-react";

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/5 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Admin</div>
          <div className="text-lg font-black text-slate-900">Expo E-Commerce</div>
        </div>
        <div className="flex items-center gap-3">
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
