import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <div className="mt-4">
        <SignIn path="/login" routing="path" />
      </div>
    </div>
  );
}
