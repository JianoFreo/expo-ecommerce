import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Shop, User } from "@/types";

export interface CurrentUserResponse {
  user: User & { role?: "admin" | "seller" | "superAdmin" | "user"; isBanned?: boolean };
  shop: Shop | null;
}

export const useCurrentUser = (enabled = true) => {
  const api = useApi();

  return useQuery<CurrentUserResponse>({
    queryKey: ["currentUser"],
    enabled,
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
  });
};
