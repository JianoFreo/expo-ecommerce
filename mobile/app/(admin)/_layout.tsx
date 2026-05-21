import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { View, ActivityIndicator } from "react-native";

export default function AdminLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, isLoading } = useCurrentUser(isSignedIn);

  if (!isLoaded || (isSignedIn && isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/(auth)" />;
  if (data?.user?.role !== "admin") return <Redirect href="/(tabs)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "#8B8B8B",
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }} />
      <Tabs.Screen name="products" options={{ title: "Products", tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} /> }} />
      <Tabs.Screen name="shops" options={{ title: "Shops", tabBarIcon: ({ color, size }) => <Ionicons name="storefront" size={size} color={color} /> }} />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} /> }} />
      <Tabs.Screen name="customers" options={{ title: "Users", tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="activities" options={{ title: "Logs", tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} /> }} />
      <Tabs.Screen name="banner" options={{ title: "Banner", tabBarIcon: ({ color, size }) => <Ionicons name="image" size={size} color={color} /> }} />
    </Tabs>
  );
}
