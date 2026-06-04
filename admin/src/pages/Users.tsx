import React, { useEffect, useState } from "react";
import { userManagementApi } from "../lib/api";
import type { User } from "../shared/types";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await userManagementApi.getAllUsers();
      setUsers(res?.users || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const toggleBan = async (u: any) => {
    try {
      if (u.isBanned) {
        await userManagementApi.unbanUser(u._id);
      } else {
        await userManagementApi.banUser({ userId: u._id });
      }
      await fetch();
    } catch (e) {}
  };

  const changeRole = async (u: any, role: string) => {
    try {
      if (!u._id) return;
      await userManagementApi.setUserRole({ userId: u._id, role });
      await fetch();
    } catch (e) {}
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {loading ? (
        <div className="mt-4">Loading…</div>
      ) : (
        <div className="mt-4 space-y-3">
          {users.map((u: any) => (
            <div key={u._id || u.id} className="p-3 border rounded flex items-center justify-between">
              <div>
                <div className="font-semibold">{u.name || u.email}</div>
                <div className="text-sm text-muted">{u.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={u.role || 'customer'}
                  onChange={(e) => changeRole(u, e.target.value)}
                  className="select select-sm"
                >
                  <option value="user">Customer</option>
                  <option value="seller">Seller</option>
                  <option value="super-admin">Super-admin</option>
                </select>
                <button className={`btn btn-sm ${u.isBanned ? "btn-success" : "btn-error"}`} onClick={() => toggleBan(u)}>
                  {u.isBanned ? "Unban" : "Ban"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
