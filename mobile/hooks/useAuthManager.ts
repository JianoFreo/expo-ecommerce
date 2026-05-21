import { useAuth } from "@clerk/clerk-expo";
import { useRole } from "@/context/RoleContext";
import { router } from "expo-router";

export function useAuthManager() {
  const { signOut } = useAuth();
  const { setSelectedRole } = useRole();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setSelectedRole(null);
      router.replace("/role-selection");
    }
  };

  const handleSwitchRole = async (newRole: "buyer" | "seller") => {
    // Switch role without signing out - just update context and navigate
    setSelectedRole(newRole);
    
    // Route to appropriate dashboard based on new role
    if (newRole === "seller") {
      router.replace("/(seller)/");
    } else {
      router.replace("/(tabs)/");
    }
  };

  return { handleLogout, handleSwitchRole };
}
