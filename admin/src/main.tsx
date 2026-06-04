import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import App from "./App";
import AppProviders from "./providers/AppProviders";
import "./index.css";
import { setTokenGetter } from "./shared";

function AuthInitializer() {
  const { getToken } = useAuth();

  useEffect(() => {
    // register token getter for axios client
    setTokenGetter(async () => {
      try {
        return await getToken();
      } catch (e) {
        return null;
      }
    });
  }, [getToken]);

  return null;
}

function Root() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.VITE_CLERK_CLIENT_ID || (window as any).VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <div className="min-h-screen grid place-items-center bg-base-100 text-base-content px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Missing Clerk key</h1>
          <p className="mt-2 text-sm opacity-70">Set VITE_CLERK_PUBLISHABLE_KEY for the admin app.</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <AuthInitializer />
      <BrowserRouter>
        <AppProviders>
          <App />
        </AppProviders>
      </BrowserRouter>
    </ClerkProvider>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<Root />);
}
