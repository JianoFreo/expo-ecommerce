import React, { useEffect, useState } from "react";
import { settingsApi } from "../lib/api";

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
    setLoading(true);
    try {
      await settingsApi.setGuestAccess(!guestEnabled);
      setGuestEnabled(!guestEnabled);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

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
    </div>
  );
}
