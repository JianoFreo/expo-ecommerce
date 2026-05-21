import React from "react";
import { Tabs } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { ActivityIndicator, View } from "react-native";

export default function SellerLayout() {
  const { isSignedIn } = useAuth();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  // Fetch user profile to verify seller role
  const { isLoading, data } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/user/profile");
      return res.data;
    },
    enabled: isSignedIn,
  });

  React.useEffect(() => {
    if (data?.user) {
      setUserRole(data.user.role);
      // Redirect if not a seller
      if (data.user.role !== "seller" && data.user.role !== "super-admin") {
        // Redirect to buyer app
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#9ca3af",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarLabel: "Products",
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarLabel: "Orders",
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarLabel: "Analytics",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}
