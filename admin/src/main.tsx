import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import App from "./App";
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

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <AuthInitializer />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<Root />);
}
