import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/utilities";
import {
  PackageSearch,
  Bot,
  Settings,
  CheckCircle,
  XCircle,
  Search,
  BellOff,
  Trash2,
  Info,
} from "lucide-react";
import { useNotifications, NotificationType, Notification } from "@/hooks/useNotifications";

const FILTERS = ["All", "Unread", "Deliveries", "Robots", "System"];

function getIconConfig(type: NotificationType) {
  switch (type) {
    case "delivery":
      return { icon: PackageSearch, bg: "#FFF5CC", color: "#800000" };
    case "robot":
      return { icon: Bot, bg: "#FEE2E2", color: "#DC2626" };
    case "system":
      return { icon: Settings, bg: "#F3F4F6", color: "#6B7280" };
    case "success":
      return { icon: CheckCircle, bg: "#DCFCE7", color: "#16A34A" };
    case "error":
      return { icon: XCircle, bg: "#FEE2E2", color: "#DC2626" };
  }
}

function filterNotifications(notifications: Notification[], filter: string, search: string) {
  let result = notifications;
  switch (filter) {
    case "Unread":
      result = result.filter((n) => !n.read);
      break;
    case "Deliveries":
      result = result.filter((n) => ["delivery", "success", "error"].includes(n.type));
      break;
    case "Robots":
      result = result.filter((n) => n.type === "robot");
      break;
    case "System":
      result = result.filter((n) => n.type === "system");
      break;
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
    );
  }
  return result;
}

export default function Notifications() {
  const { notifications, markAllRead, markRead, clearAll } = useNotifications();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = filterNotifications(notifications, filter, search);

  return (
    <AppLayout title="Notifications">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mt-0.5">All system alerts and updates</p>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-[#800000]/5"
          style={{ borderColor: "#800000", color: "#800000" }}
        >
          <Trash2 className="h-4 w-4" />
          Clear all
        </button>
      </div>

      {/* Filter + search bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-full outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filter tabs with info */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: filter === f ? "#800000" : "#F3F4F6",
                color: filter === f ? "#FFD700" : "#6B7280",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Mark all read */}
        <button
          onClick={markAllRead}
          className="ml-auto text-[12px] font-semibold px-4 py-1.5 rounded-full transition-opacity hover:opacity-80 shrink-0"
          style={{ background: "#FFD700", color: "#800000" }}
        >
          Mark all as read
        </button>
      </div>

      {/* Notification cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <BellOff className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-base font-medium text-gray-500">No notifications</p>
          <p className="text-sm text-gray-400 mt-1">All caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((n) => {
            const cfg = getIconConfig(n.type);
            const Icon = cfg.icon;
            const isHovered = hoveredId === n.id;
            return (
              <div
                key={n.id}
                className="relative flex items-start gap-4 bg-white rounded-xl border p-4 transition-shadow"
                style={{
                  borderColor: "#E5E7EB",
                  borderLeftWidth: 3,
                  borderLeftColor: n.read ? "transparent" : "#800000",
                  boxShadow: isHovered ? "0 4px 16px rgba(0,0,0,0.08)" : undefined,
                }}
                onMouseEnter={() => setHoveredId(n.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Icon */}
                <div
                  className="shrink-0 flex items-center justify-center rounded-full"
                  style={{ width: 48, height: 48, background: cfg.bg }}
                >
                  <Icon style={{ width: 20, height: 20, color: cfg.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-[#1A1A1A]">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.description}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{n.timestamp}</p>
                </div>

                {/* Right actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!n.read && (
                    <span className="block w-2 h-2 rounded-full" style={{ background: "#3B82F6" }} />
                  )}
                  {(isHovered || !n.read) && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-[11px] font-medium transition-opacity hover:opacity-70"
                      style={{ color: "#800000", opacity: isHovered ? 1 : 0 }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}