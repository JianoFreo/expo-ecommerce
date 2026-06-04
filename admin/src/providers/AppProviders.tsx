import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useRealtimeSync } from "../hooks/useRealtimeSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function RealtimeBridge({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  useRealtimeSync(Boolean(isSignedIn));
  return <>{children}</>;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeBridge>{children}</RealtimeBridge>
    </QueryClientProvider>
  );
}
