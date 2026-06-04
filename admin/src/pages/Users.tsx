import React, { useEffect, useState } from "react";
import axios from "../shared";
import type { User } from "../shared/types";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    axios
      .get("/users")
      .then((res) => setUsers(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <ul className="mt-4 space-y-2">
        {users.map((u) => (
          <li key={u.id} className="p-3 border rounded">
            <div className="font-semibold">{u.name || u.email}</div>
            <div className="text-sm text-muted">{u.role}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
