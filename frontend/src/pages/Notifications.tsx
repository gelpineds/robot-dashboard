// src/pages/Notifications.tsx
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  Bell,
  BellOff,
  CheckCheck,
  Search,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { NotificationCard } from "@/components/ui/notifications";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "All" | "Unread" | "Action Required" | "Deliveries" | "Robots";

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyFilters(notifications: any[], tab: FilterTab, search: string, showAll: boolean) {
  let result = showAll ? notifications : notifications.filter((n) => !n.is_read);

  switch (tab) {
    case "Unread":
      result = result.filter((n) => !n.is_read);
      break;
    case "Action Required":
      result = result.filter((n) => n.is_action_required);
      break;
    case "Deliveries":
      result = result.filter(
        (n) => n.type?.startsWith("delivery_") || n.type === "robot_dispatched"
      );
      break;
    case "Robots":
      result = result.filter(
        (n) => n.type === "robot_low_battery" || n.type === "robot_offline"
      );
      break;
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q)
    );
  }

  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FILTER_TABS: FilterTab[] = ["All", "Unread", "Action Required", "Deliveries", "Robots"];

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    deleteNotification,
  } = useNotifications();

  const [tab, setTab] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(
    () => applyFilters(notifications, tab, search, showAll),
    [notifications, tab, search, showAll]
  );

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this notification?")) {
      deleteNotification(id);
    }
  };

  // ── Empty state: no notifications exist at all
  const noNotificationsAtAll = notifications.length === 0;

  // ── Empty state: notifications exist but none are unread (default view)
  const allCaughtUp = !showAll && !noNotificationsAtAll && filtered.length === 0 && tab === "All" && !search.trim();

  return (
    <AppLayout title="Notifications">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span
                className="inline-flex items-center justify-center text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.4rem]"
                style={{ background: "#800000", color: "#FFD700" }}
              >
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All your system alerts and delivery updates
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${
            unreadCount === 0 ? "opacity-50 cursor-not-allowed" : "hover:brightness-105"
          }`}
          style={{ background: "#FFD700", color: "#800000" }}
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      {/* ── Sticky Filter + Search Bar ───────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-4 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notifications…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-full outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_TABS.map((f) => (
              <button
                key={f}
                onClick={() => setTab(f)}
                className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                style={{
                  background: tab === f ? "#800000" : "#E5E7EB",
                  color: tab === f ? "#FFD700" : "#6B7280",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Show All Toggle ───────────────────────────────────────────────── */}
      {!noNotificationsAtAll && (
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
            style={{ borderColor: "#800000", color: "#800000" }}
          >
            {showAll ? "Unread only" : "Show all"}
          </button>
        </div>
      )}

      {/* ── Empty: no notifications at all ───────────────────────────────── */}
      {noNotificationsAtAll && (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <BellOff className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-base font-semibold text-gray-500">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            They'll appear here when deliveries and robot events occur.
          </p>
        </div>
      )}

      {/* ── Empty: all caught up (unread-only view, nothing unread) ──────── */}
      {allCaughtUp && (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <Bell className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-base font-semibold text-gray-500">You're all caught up!</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Toggle 'Show all' to see past notifications.
          </p>
          <button
            onClick={() => setShowAll(true)}
            className="mt-4 text-sm font-semibold px-5 py-2 rounded-full transition-opacity hover:opacity-80"
            style={{ background: "#FFD700", color: "#800000" }}
          >
            Show all
          </button>
        </div>
      )}

      {/* ── Empty: filtered result is empty but notifications exist ──────── */}
      {!noNotificationsAtAll && !allCaughtUp && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-base font-semibold text-gray-500">No results found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query.</p>
        </div>
      )}

      {/* ── Notification Cards ────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="flex flex-col">
          {filtered.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onDelete={handleDelete}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}