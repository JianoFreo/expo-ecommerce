import { Stack } from "expo-router";
import "../global.css";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StripeProvider } from "@stripe/stripe-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RoleProvider } from "@/context/RoleContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AuthTokenBridge from "@/components/AuthTokenBridge";
import GuestBanner from '@/components/GuestBanner';
import RealtimeBridge from "@/components/RealtimeBridge";

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
    <SafeAreaProvider>
      <RoleProvider>
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={"pk_test_YWRhcHRlZC1oZXJyaW5nLTQ0LmNsZXJrLmFjY291bnRzLmRldiQ"}
        >
          <AuthTokenBridge />
          <ThemeProvider>
            <GuestBanner />
            <QueryClientProvider client={queryClient}>
              <RealtimeBridge />
              <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY! || "pk_test_51TYuWiBQ1VXJ0n7TvbraK2UGzNojJ7P7cTTowroKlCCKHNsQgDPSvFF6cTVOZ0VP9W1ubgIDa19wnqpEEeHCe5zf000mxmpSHh"!}>
                <Stack screenOptions={{ headerShown: false }} />
              </StripeProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </ClerkProvider>
      </RoleProvider>
    </SafeAreaProvider>
  );
}
