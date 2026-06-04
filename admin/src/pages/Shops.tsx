import React, { useEffect, useState } from "react";
import axios from "../shared";

export default function Shops() {
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    axios
      .get("/admin/shops")
      .then((res) => {
        if (mounted) setShops(res.data?.shops || []);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Shops</h1>
      <div className="mt-4 space-y-3">
        {shops.map((s) => (
          <div key={s._id || s.id} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{s.name}</div>
              <div className="text-sm text-muted">Owner: {s.owner?.name || s.owner}</div>
            </div>
            <div className="text-sm">{s.isVerified ? "Verified" : "Unverified"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
