import { useAuth } from "@clerk/clerk-expo";
import { useRole } from "@/context/RoleContext";
import { router } from "expo-router";
import { Alert } from "react-native";

export function useAuthManager() {
  const { signOut } = useAuth();
  const { setSelectedRole } = useRole();

  const handleLogout = async () => {
    try {
      await signOut();
      setSelectedRole(null);
      router.replace("/role-selection");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const handleSwitchRole = async () => {
    try {
      await signOut();
      setSelectedRole(null);
      router.replace("/role-selection");
    } catch (error) {
      console.error("Switch role error:", error);
      Alert.alert("Error", "Failed to switch role. Please try again.");
    }
  };

  return { handleLogout, handleSwitchRole };
}
