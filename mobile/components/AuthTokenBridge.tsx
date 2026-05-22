import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { setAxiosTokenGetter } from "@/lib/axios";
import { useRole } from "@/context/RoleContext";

export default function AuthTokenBridge() {
  const { getToken, isSignedIn } = useAuth();
  const { selectedRole, setSelectedRole } = useRole();

  useEffect(() => {
    setAxiosTokenGetter(() => getToken());
    return () => setAxiosTokenGetter(null);
  }, [getToken]);

  // Clear guest role when user signs in with Clerk
  useEffect(() => {
    if (isSignedIn && selectedRole === 'guest') {
      setSelectedRole('buyer');
    }
  }, [isSignedIn, selectedRole, setSelectedRole]);

  return null;
}
