import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRole } from '@/context/RoleContext';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthManager } from "@/hooks/useAuthManager";

const MENU_ITEMS = [
  { id: 1, icon: "person-outline", title: "Edit Profile", color: "#3B82F6", action: "/profile" },
  { id: 2, icon: "list-outline", title: "Orders", color: "#10B981", action: "/orders" },
  { id: 3, icon: "location-outline", title: "Addresses", color: "#F59E0B", action: "/addresses" },
  { id: 4, icon: "heart-outline", title: "Wishlist", color: "#EF4444", action: "/wishlist" },
] as const;

const THEME_STORAGE_KEY = "buyer-profile-theme";

const THEME_OPTIONS = [
  { id: "green", label: "Green", subtitle: "Classic storefront", icon: "leaf-outline", primary: "#1DB954" },
  { id: "blue", label: "Blue", subtitle: "Cool and clean", icon: "water-outline", primary: "#3B82F6" },
  { id: "orange", label: "Orange", subtitle: "Warm and bold", icon: "sunny-outline", primary: "#F97316" },
  { id: "rose", label: "Rose", subtitle: "Soft and modern", icon: "heart-outline", primary: "#F43F5E" },
] as const;

type ThemeId = (typeof THEME_OPTIONS)[number]["id"];

const DEFAULT_THEME = THEME_OPTIONS[0];

const getThemeById = (themeId: string | null | undefined) =>
  THEME_OPTIONS.find((theme) => theme.id === themeId) ?? DEFAULT_THEME;

const ProfileScreen = () => {
  const { user } = useUser();
  const { selectedRole } = useRole();
  const { isLoaded, isSignedIn } = useAuth();
  const { handleLogout, handleSwitchRole } = useAuthManager();
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(DEFAULT_THEME.id);

  const selectedTheme = getThemeById(selectedThemeId);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (mounted && savedTheme) {
          setSelectedThemeId(getThemeById(savedTheme).id);
        }
      } catch (error) {
        console.warn("Failed to load buyer theme", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleThemeChange = async (themeId: ThemeId) => {
    setSelectedThemeId(themeId);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (error) {
      console.warn("Failed to persist buyer theme", error);
    }
  };

  const handleMenuPress = (action: (typeof MENU_ITEMS)[number]["action"]) => {
    router.push(action);
  };

  if (!isSignedIn || selectedRole === 'guest') {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="person-circle-outline" size={88} color="#666" />
          <Text className="text-text-primary font-semibold text-xl mt-4">Please sign in</Text>
          <Text className="text-text-secondary text-center mt-2">Sign in to access your profile, wishlist and cart.</Text>
          <TouchableOpacity
              className="rounded-2xl px-6 py-3 mt-6"
              style={{ backgroundColor: selectedTheme.primary }}
            onPress={() => router.push('/(auth)')}
          >
            <Text className="text-background font-bold">Sign In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER */}
        <View className="px-6 pb-8">
          <View
            className="bg-surface rounded-3xl p-6"
            style={{ borderWidth: 1, borderColor: `${selectedTheme.primary}22` }}
          >
            <View className="flex-row items-center">
              <View className="relative">
                <Image
                  source={user?.imageUrl}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                  transition={200}
                />
                <View
                  className="absolute -bottom-1 -right-1 rounded-full size-7 items-center justify-center border-2 border-surface"
                  style={{ backgroundColor: selectedTheme.primary }}
                >
                  <Ionicons name="checkmark" size={16} color="#121212" />
                </View>
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-text-primary text-2xl font-bold mb-1">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {user?.emailAddresses?.[0]?.emailAddress || "No email"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* THEME PICKER */}
        <View className="mb-4 mx-6 bg-surface rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-primary text-lg font-bold">Theme</Text>
            <View className="flex-row items-center">
              <View className="rounded-full w-2.5 h-2.5 mr-2" style={{ backgroundColor: selectedTheme.primary }} />
              <Text className="text-text-secondary text-xs uppercase tracking-wide">
                {selectedTheme.label}
              </Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
            {THEME_OPTIONS.map((theme, index) => {
              const isSelected = theme.id === selectedTheme.id;

              return (
                <TouchableOpacity
                  key={theme.id}
                  className="rounded-2xl px-4 py-3 mr-3 border"
                  activeOpacity={0.8}
                  onPress={() => handleThemeChange(theme.id)}
                  style={{
                    backgroundColor: isSelected ? `${theme.primary}18` : "#181818",
                    borderColor: isSelected ? theme.primary : "#3E3E3E",
                    marginRight: index === THEME_OPTIONS.length - 1 ? 0 : 12,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <Ionicons name={theme.icon} size={20} color={theme.primary} />
                  </View>
                  <Text className="text-text-primary font-semibold text-sm">{theme.label}</Text>
                  <Text className="text-text-secondary text-xs mt-0.5">{theme.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* MENU ITEMS */}
        <View className="flex-row flex-wrap gap-2 mx-6 mb-3">
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-surface rounded-2xl p-6 items-center justify-center"
              style={{ width: "48%" }}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.action)}
            >
              <View
                className="rounded-full w-16 h-16 items-center justify-center mb-4"
                style={{ backgroundColor: `${selectedTheme.primary}20` }}
              >
                <Ionicons name={item.icon} size={28} color={selectedTheme.primary} />
              </View>
              <Text className="text-text-primary font-bold text-base">{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PRIVACY AND SECURITY LINK */}
        <View className="mb-3 mx-6 bg-surface rounded-2xl p-4">
          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            activeOpacity={0.7}
            onPress={() => router.push('/privacy-security')}
          >
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={22} color={selectedTheme.primary} />
              <Text className="text-text-primary font-semibold ml-3">Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* SWITCH ROLE BTN */}
        <TouchableOpacity
          className="mx-6 mb-3 bg-surface rounded-2xl py-5 flex-row items-center justify-center border-2 border-orange-500/20"
          activeOpacity={0.8}
          onPress={() => handleSwitchRole("seller")}
        >
          <Ionicons name="swap-horizontal-outline" size={22} color="#F59E0B" />
          <Text className="text-orange-500 font-bold text-base ml-2">Switch to Seller</Text>
        </TouchableOpacity>

        {/* SIGNOUT BTN */}
        <TouchableOpacity
          className="mx-6 mb-3 bg-surface rounded-2xl py-5 flex-row items-center justify-center border-2 border-red-500/20"
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base ml-2">Sign Out</Text>
        </TouchableOpacity>

        <Text className="mx-6 mb-3 text-center text-text-secondary text-xs">Version 1.0.0</Text>
      </ScrollView>
    </SafeScreen>
  );
};

export default ProfileScreen;

// REACT NATIVE IMAGE VS EXPO IMAGE:

// React Native Image (what we have used so far):
// import { Image } from "react-native";
//
// <Image source={{ uri: url }} />

// Basic image component
// No built-in caching optimization
// Requires source={{ uri: string }}

// Expo Image (from expo-image):
// import { Image } from "expo-image";

// <Image source={url} />

// Caching - automatic disk/memory caching
// Placeholder - blur hash, thumbnail while loading
// Transitions - crossfade, fade animations
// Better performance - optimized native rendering
// Simpler syntax: source={url} or source={{ uri: url }}
// Supports contentFit instead of resizeMode

// Example with expo-image:
// <Image   source={user?.imageUrl}  placeholder={blurhash}  transition={200}  contentFit="cover"  className="size-20 rounded-full"/>

// Recommendation: For production apps, expo-image is better — faster, cached, smoother UX.
// React Native's Image works fine for simple cases though.
