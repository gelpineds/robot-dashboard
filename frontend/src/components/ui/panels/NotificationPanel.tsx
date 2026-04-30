// src/components/ui/NotificationPanel.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PackageSearch,
  Bot,
  MapPin,
  CheckCircle2,
  BatteryLow,
  WifiOff,
  XCircle,
  BellOff,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bellRef?: React.RefObject<HTMLElement>;
  activeFilter?: string;
  onFilterChange?: (f: string) => void;
}

type NotifType =
  | "delivery_created"
  | "robot_dispatched"
  | "robot_arrived"
  | "delivery_completed"
  | "robot_low_battery"
  | "robot_offline"
  | "delivery_cancelled";

function getIconConfig(type: NotifType) {
  switch (type) {
    case "delivery_created":
      return { icon: PackageSearch, bg: "bg-amber-50", color: "text-amber-600" };
    case "robot_dispatched":
      return { icon: Bot, bg: "bg-blue-50", color: "text-blue-600" };
    case "robot_arrived":
      return { icon: MapPin, bg: "bg-green-50", color: "text-green-600" };
    case "delivery_completed":
      return { icon: CheckCircle2, bg: "bg-green-50", color: "text-green-600" };
    case "robot_low_battery":
      return { icon: BatteryLow, bg: "bg-red-50", color: "text-red-500" };
    case "robot_offline":
      return { icon: WifiOff, bg: "bg-red-50", color: "text-red-500" };
    case "delivery_cancelled":
      return { icon: XCircle, bg: "bg-gray-100", color: "text-gray-500" };
    default:
      return { icon: PackageSearch, bg: "bg-gray-100", color: "text-gray-500" };
  }
}

function formatRelativeTime(created_at: string): string {
  const now = Date.now();
  const then = new Date(created_at).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60) return "Just now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m} min${m !== 1 ? "s" : ""} ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hr${h !== 1 ? "s" : ""} ago`;
  }
  if (diff < 172800) return "Yesterday";
  const d = Math.floor(diff / 86400);
  return `${d} days ago`;
}

const FILTERS = ["All", "Unread", "Action Required"];

export function NotificationPanel({
  isOpen,
  onClose,
  bellRef,
}: NotificationPanelProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const { notifications, markAsRead, markAllAsRead } =
    useNotifications();

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        if (!bellRef?.current || !bellRef.current.contains(target)) {
          onClose();
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, bellRef]);

  if (!isOpen) return null;

  // Filter
  const filtered = notifications.filter((n) => {
    if (activeFilter === "Unread") return !n.is_read;
    if (activeFilter === "Action Required") return n.is_action_required;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-50 flex flex-col"
      style={{
        width: 380,
        maxHeight: 520,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #E5E7EB",
        boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
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
            onClick={markAllAsRead}
            className="text-xs font-medium hover:underline"
            style={{ color: "#800000" }}
          >
            Mark all read
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="text-[11px] font-medium px-3 py-1 rounded-full transition-colors"
              style={{
                background: activeFilter === f ? "#800000" : "#F3F4F6",
                color: activeFilter === f ? "#fff" : "#6B7280",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <BellOff className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs">All caught up!</p>
          </div>
        ) : (
          filtered.map((n) => {
            const cfg = getIconConfig(n.type as NotifType);
            const Icon = cfg.icon;

            let rowBg = "bg-white";
            let borderLeft = "";
            if (!n.is_read && n.is_action_required) {
              rowBg = "bg-amber-50";
              borderLeft = "border-l-2 border-[#FFD700]";
            } else if (!n.is_read) {
              rowBg = "bg-[#FFF5F5]";
              borderLeft = "border-l-2 border-[#800000]/20";
            }

            return (
              <div
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.link) navigate(n.link);
                  onClose();
                }}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 hover:bg-gray-50 ${rowBg} ${borderLeft}`}
              >
                {/* Icon */}
                <div
                  className={`shrink-0 flex items-center justify-center rounded-full ${cfg.bg}`}
                  style={{ width: 40, height: 40 }}
                >
                  <Icon className={`${cfg.color}`} style={{ width: 18, height: 18 }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 leading-snug truncate">
                    {n.title}
                  </p>
                  <p className="text-[12px] text-gray-500 mt-0.5 leading-snug line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {formatRelativeTime(n.created_at)}
                  </p>
                </div>

                {/* Dot */}
                <div className="shrink-0 pt-1">
                  {!n.is_read && (
                    n.is_action_required ? (
                      <span className="block w-2 h-2 rounded-full bg-[#FFD700] ring-2 ring-[#FFD700]/40 animate-pulse" />
                    ) : (
                      <span className="block w-2 h-2 rounded-full bg-blue-500" />
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 shrink-0">
        <button
          onClick={() => { onClose(); navigate("/notifications"); }}
          className="w-full py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#800000", color: "#FFD700" }}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}