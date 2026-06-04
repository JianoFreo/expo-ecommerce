import React, { useEffect, useState } from "react";
import { settingsApi, activityApi } from "../lib/api";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [guestEnabled, setGuestEnabled] = useState<boolean | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.get();
      setGuestEnabled(Boolean(res?.settings?.guestEnabled));
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const toggleGuest = async () => {
    if (guestEnabled === null) return;
    // confirmation modal
    const ok = window.confirm(
      `Are you sure you want to ${guestEnabled ? 'disable' : 'enable'} guest browsing?`
    );
    if (!ok) return;
    setLoading(true);
    try {
      await settingsApi.setGuestAccess(!guestEnabled);
      setGuestEnabled(!guestEnabled);
      // refresh recent activities after change
      await fetchActivities();
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const [activities, setActivities] = useState<any[]>([]);
  const fetchActivities = async () => {
    try {
      const res = await activityApi.getRecent();
      setActivities(res?.activities || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-4">
        {loading && guestEnabled === null ? (
          <div>Loading…</div>
        ) : (
          <div className="flex items-center gap-4">
            <div>
              <div className="font-semibold">Guest Browsing</div>
              <div className="text-sm text-muted">Allow guests to browse products without signing in</div>
            </div>
            <div>
              <label className="swap swap-rotate">
                <input type="checkbox" checked={!!guestEnabled} onChange={toggleGuest} />
                <div className="swap-on btn btn-sm">Enabled</div>
                <div className="swap-off btn btn-sm">Disabled</div>
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <div className="mt-2 space-y-2">
          {activities.length === 0 ? (
            <div className="text-sm text-muted">No recent activity</div>
          ) : (
            activities.map((a) => (
              <div key={a._id} className="p-2 border rounded bg-[#0b0d10]">
                <div className="text-sm">{a.description}</div>
                <div className="text-xs text-muted">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
