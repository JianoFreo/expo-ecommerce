import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function Root() {
  const { isSignedIn } = useAuth();

  // Simple gate: if not signed in, go to auth, otherwise let the Stack handle routing
  if (!isSignedIn) {
    return <Redirect href="/(auth)" />;
  }

  // Signed in — the Stack will show one of (tabs), (admin), or (auth) based on each layout's checks
  // Default to (tabs) and let (admin) layout redirect if user is admin/seller
  return <Redirect href="/(tabs)" />;
}
