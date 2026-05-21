import SafeScreen from "@/components/SafeScreen";
import { useApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Text, View, ScrollView } from "react-native";

export default function AdminCustomers() {
  const api = useApi();

  const { data } = useQuery({
    queryKey: ["adminCustomers"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data.users;
    },
  });

  return (
    <SafeScreen>
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold text-text-primary mb-2">Users</Text>
        <Text className="text-text-secondary mb-6">All users, including sellers and the super admin.</Text>

        {(data || []).map((user) => (
          <View key={user._id} className="bg-surface rounded-3xl p-4 mb-4">
            <Text className="text-text-primary font-bold">{user.name}</Text>
            <Text className="text-text-secondary text-sm mt-1">{user.email}</Text>
            <Text className="text-text-secondary text-sm">Role: {user.role || "user"}</Text>
            <Text className="text-text-secondary text-sm">Banned: {user.isBanned ? "Yes" : "No"}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}
