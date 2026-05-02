import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PackageSearch,
  Bot,
  Settings,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";

export type NotificationType = "delivery" | "robot" | "system" | "success" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

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

function filterNotifications(notifications: Notification[], filter: string) {
  switch (filter) {
    case "Unread":
      return notifications.filter((n) => !n.read);
    case "Deliveries":
      return notifications.filter((n) => n.type === "delivery" || n.type === "success" || n.type === "error");
    case "Robots":
      return notifications.filter((n) => n.type === "robot");
    case "System":
      return notifications.filter((n) => n.type === "system");
    default:
      return notifications;
  }
}

export function NotificationPanel({
  open,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkRead,
  activeFilter,
  onFilterChange,
}: NotificationPanelProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = filterNotifications(notifications, activeFilter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (n: Notification) => {
    onMarkRead(n.id);
    if (n.type === "delivery" || n.type === "success" || n.type === "error") {
      navigate("/track");
      onClose();
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-50"
      style={{
        width: 380,
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #E5E7EB",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#800000] text-[15px]">Notifications</span>
            {unreadCount > 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#FFD700", color: "#800000" }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onMarkAllRead}
            className="text-[12px] font-medium hover:underline"
            style={{ color: "#800000" }}
          >
            Mark all as read
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className="text-[11px] font-medium px-3 py-1 rounded-full transition-colors"
              style={{
                background: activeFilter === f ? "#800000" : "#F3F4F6",
                color: activeFilter === f ? "#FFD700" : "#6B7280",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Bell className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs">All caught up!</p>
          </div>
        ) : (
          filtered.map((n) => {
            const cfg = getIconConfig(n.type);
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
                style={{
                  background: n.read ? "#fff" : "#FFF5F5",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "#fff" : "#FFF5F5")}
              >
                {/* Icon */}
                <div
                  className="shrink-0 flex items-center justify-center rounded-full"
                  style={{ width: 40, height: 40, background: cfg.bg }}
                >
                  <Icon style={{ width: 16, height: 16, color: cfg.color }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1A1A1A] leading-snug truncate">{n.title}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.description}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{n.timestamp}</p>
                </div>

                {/* Unread dot */}
                <div className="shrink-0 pt-1">
                  {!n.read && (
                    <span
                      className="block w-2 h-2 rounded-full"
                      style={{ background: "#3B82F6" }}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => { navigate("/notifications"); onClose(); }}
          className="w-full py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#800000", color: "#FFD700" }}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}