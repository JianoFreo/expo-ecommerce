import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router";
import * as Sentry from "@sentry/react";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const queryClient = new QueryClient();

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  enableLogs: true,

  integrations: [Sentry.replayIntegration()],
  // Session Replay
  replaysSessionSampleRate: 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0,
});

// Ensure DaisyUI theme is applied on startup (matches the dark forest look)
// This sets the data-theme attribute on the <html> element so DaisyUI uses that theme.
// try {
//   const theme = import.meta.env.VITE_DAISYUI_THEME || "forest"; // default to forest
//   document.documentElement.setAttribute("data-theme", theme);
//   // Also add the 'dark' class if the theme is dark-like to ensure any Tailwind dark styles apply
//   if (theme === "forest" || theme === "dark") {
//     document.documentElement.classList.add("dark");
//   }
// } catch (e) {
//   // server-side or build-time environment may not have document; ignore
// }


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);