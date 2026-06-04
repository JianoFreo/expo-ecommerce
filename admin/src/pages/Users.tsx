import React, { useEffect, useState } from "react";
import axios from "../shared";
import type { User } from "../shared/types";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/users");
      setUsers(res.data?.users || []);
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
      const endpoint = u.isBanned ? `/admin/users/${u._id}/unban` : `/admin/users/${u._id}/ban`;
      await axios.patch(endpoint);
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
                <div className="text-sm text-muted">{u.role}</div>
              </div>
              <div>
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
