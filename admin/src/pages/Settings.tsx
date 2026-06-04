import React, { useCallback, useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import { settingsApi, activityApi, userApi } from "../lib/api";
import type { ActivityLogEntry } from "../shared/types";

const SETTINGS_ACTIVITY_TYPE = "settings_update";
const PAGE_SIZE = 10;

type ProfileUser = {
  name?: string;
  email?: string;
};

function getActivityActor(activity: ActivityLogEntry) {
  if (activity.user?.name || activity.user?.email) {
    return {
      name: activity.user.name || "Unknown",
      email: activity.user.email || "",
    };
  }
  return {
    name: activity.metadata?.actorName || "Unknown",
    email: activity.metadata?.actorEmail || "",
  };
}

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [guestEnabled, setGuestEnabled] = useState<boolean | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingGuestEnabled, setPendingGuestEnabled] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.get();
      setGuestEnabled(Boolean(res?.settings?.guestEnabled));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await userApi.profile();
      const user = res.user;
      if (user) {
        setCurrentUser({ name: user.name, email: user.email });
      }
    } catch {
      // ignore
    }
  };

  const fetchActivities = useCallback(async () => {
    setActivityLoading(true);
    try {
      const res = await activityApi.list({
        type: SETTINGS_ACTIVITY_TYPE,
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setActivities(res?.activities || []);
      setPagination({
        total: res?.pagination?.total ?? 0,
        totalPages: res?.pagination?.totalPages ?? 1,
      });
    } catch {
      // ignore
    } finally {
      setActivityLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const openConfirm = () => {
    if (guestEnabled === null) return;
    setPendingGuestEnabled(!guestEnabled);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (loading) return;
    setConfirmOpen(false);
    setPendingGuestEnabled(null);
  };

  const confirmToggle = async () => {
    if (pendingGuestEnabled === null) return;
    setLoading(true);
    try {
      await settingsApi.setGuestAccess(pendingGuestEnabled);
      setGuestEnabled(pendingGuestEnabled);
      setConfirmOpen(false);
      setPendingGuestEnabled(null);
      setPage(1);
      await fetchActivities();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const actorLabel = currentUser?.name || currentUser?.email || "You";
  const nextStateLabel =
    pendingGuestEnabled === null
      ? ""
      : pendingGuestEnabled
        ? "enable"
        : "disable";

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
              <div className="text-sm text-muted">
                Allow guests to browse products without signing in
              </div>
            </div>
            <div>
              <label className="swap swap-rotate">
                <input
                  type="checkbox"
                  checked={!!guestEnabled}
                  onChange={openConfirm}
                  disabled={loading}
                />
                <div className="swap-on btn btn-sm">Enabled</div>
                <div className="swap-off btn btn-sm">Disabled</div>
              </label>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Change guest browsing?"
        message={`This will ${nextStateLabel} guest browsing for all clients.`}
        confirmLabel={pendingGuestEnabled ? "Enable" : "Disable"}
        onConfirm={confirmToggle}
        onCancel={closeConfirm}
        loading={loading}
      >
        <div className="rounded-lg border border-white/10 bg-[#0b0d10] p-3 text-sm space-y-2">
          <div>
            <span className="text-white/60">Changed by: </span>
            <span className="font-medium">{actorLabel}</span>
            {currentUser?.email ? (
              <span className="text-white/60"> ({currentUser.email})</span>
            ) : null}
          </div>
          <div>
            <span className="text-white/60">Setting: </span>
            <span className="font-medium">guestEnabled</span>
          </div>
          <div>
            <span className="text-white/60">New value: </span>
            <span className="font-medium">
              {pendingGuestEnabled === null
                ? "—"
                : pendingGuestEnabled
                  ? "Enabled"
                  : "Disabled"}
            </span>
          </div>
        </div>
      </ConfirmModal>

      <div className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Settings audit log</h2>
          <input
            type="search"
            placeholder="Search log…"
            className="input input-sm input-bordered w-full sm:max-w-xs bg-[#0b0d10]"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="mt-3 space-y-2">
          {activityLoading ? (
            <div className="text-sm text-muted">Loading activity…</div>
          ) : activities.length === 0 ? (
            <div className="text-sm text-muted">No settings changes recorded</div>
          ) : (
            activities.map((a) => {
              const actor = getActivityActor(a);
              return (
                <div key={a._id} className="p-3 border rounded bg-[#0b0d10]">
                  <div className="text-sm">{a.description}</div>
                  <div className="mt-1 text-xs text-muted">
                    {actor.name}
                    {actor.email ? ` · ${actor.email}` : ""}
                    {" · "}
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                  {typeof a.metadata?.guestEnabled === "boolean" ? (
                    <div className="mt-1 text-xs">
                      <span className="badge badge-sm badge-outline">
                        guestEnabled: {a.metadata.guestEnabled ? "on" : "off"}
                      </span>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {pagination.totalPages > 1 || pagination.total > 0 ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-muted">
              Page {page} of {pagination.totalPages} ({pagination.total} entries)
            </span>
            <div className="join">
              <button
                type="button"
                className="btn btn-sm join-item"
                disabled={page <= 1 || activityLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-sm join-item"
                disabled={page >= pagination.totalPages || activityLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
