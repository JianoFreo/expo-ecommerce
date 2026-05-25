import { Stack } from "expo-router";
import "../global.css";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StripeProvider } from "@stripe/stripe-react-native";
import { RoleProvider } from "@/context/RoleContext";
import AuthTokenBridge from "@/components/AuthTokenBridge";
import GuestBanner from '@/components/GuestBanner';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      console.error("[React Query] query error", {
        type: "react-query-error",
        queryKey: query.queryKey[0]?.toString() || "unknown",
        errorMessage: error?.message,
        statusCode: error?.response?.status,
        queryKeyFull: query.queryKey,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      // global error handler for all mutations
      console.error("[React Query] mutation error", {
        type: "react-query-mutation-error",
        errorMessage: error?.message,
        statusCode: error?.response?.status,
      });
    },
  }),
});

export default function RootLayout() {
  return (
    <RoleProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <AuthTokenBridge />
        <GuestBanner />
        <QueryClientProvider client={queryClient}>
          <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
            <Stack screenOptions={{ headerShown: false }} />
          </StripeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </RoleProvider>
  );
}
