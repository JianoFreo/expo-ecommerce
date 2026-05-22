import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AuthRoutesLayout() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return null; // for a better ux

  return <Stack screenOptions={{ headerShown: false }} />;
}
