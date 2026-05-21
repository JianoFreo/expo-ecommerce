import SafeScreen from "@/components/SafeScreen";
import { useApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Text, View, ScrollView } from "react-native";

export default function AdminActivities() {
  const api = useApi();

  const { data } = useQuery({
    queryKey: ["adminActivities"],
    queryFn: async () => {
      const { data } = await api.get("/admin/activities");
      return data.activities;
    },
  });

  return (
    <SafeScreen>
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold text-text-primary mb-2">Activity Logs</Text>
        <Text className="text-text-secondary mb-6">Recent admin events from the shared backend.</Text>

        {(data || []).map((activity) => (
          <View key={activity._id} className="bg-surface rounded-3xl p-4 mb-4">
            <Text className="text-text-primary font-bold">{activity.type}</Text>
            <Text className="text-text-secondary text-sm mt-1">{activity.description}</Text>
            <Text className="text-text-secondary text-xs mt-2">{new Date(activity.createdAt).toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}
