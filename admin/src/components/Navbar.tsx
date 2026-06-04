import React from "react";
import { SignOutButton, UserButton, useAuth } from "@clerk/clerk-react";

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="w-full bg-white shadow px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-lg font-bold">Expo E‑Commerce Admin</div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <UserButton />
              <SignOutButton>
                <button className="btn btn-ghost">Sign out</button>
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
