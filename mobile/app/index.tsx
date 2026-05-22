import { useRole } from '@/context/RoleContext';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

export default function RootIndex() {
  const { selectedRole } = useRole();
  const { isSignedIn } = useAuth();

  // Guest or unauthenticated buyer → buyer dashboard
  if (selectedRole === 'guest' || selectedRole === 'buyer') {
    return <Redirect href="/(tabs)" />;
  }

  // Seller → seller shop
  if (selectedRole === 'seller') {
    return <Redirect href="/(seller)" />;
  }

  // Super admin → admin dashboard (may not exist on mobile)
  if (selectedRole === 'super-admin') {
    return <Redirect href="/" />;
  }

  // No role → auth or role selection
  return <Redirect href="/(auth)" />;
}
