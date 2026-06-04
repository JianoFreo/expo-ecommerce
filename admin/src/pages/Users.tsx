import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi, unwrapUsers } from "../lib/api";
import { queryKeys } from "../lib/queryKeys";
import type { User, UserRole } from "../shared/types";

export default function Users() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => unwrapUsers(await userApi.list()),
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, isBanned }: { userId: string; isBanned: boolean }) =>
      isBanned ? userApi.unban(userId) : userApi.ban(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      userApi.setRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {isLoading ? (
        <div className="mt-4">Loading…</div>
      ) : (
        <div className="mt-4 space-y-3">
          {users.map((user: User) => (
            <div key={user._id} className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="font-semibold">{user.name || user.email}</div>
                <div className="text-sm text-muted">{user.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={user.role || "user"}
                  onChange={(e) =>
                    roleMutation.mutate({ userId: user._id, role: e.target.value as UserRole })
                  }
                  className="select select-sm"
                >
                  <option value="user">Customer</option>
                  <option value="seller">Seller</option>
                  <option value="super-admin">Super-admin</option>
                </select>
                <button
                  type="button"
                  className={`btn btn-sm ${user.isBanned ? "btn-success" : "btn-error"}`}
                  onClick={() => banMutation.mutate({ userId: user._id, isBanned: Boolean(user.isBanned) })}
                >
                  {user.isBanned ? "Unban" : "Ban"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
