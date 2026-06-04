// NotificationCard.tsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";          
import { Trash2, ArrowRight, Check } from "lucide-react";
import { Notification } from "@/context/NotificationContext";
import { getIconConfig, formatTimestamp } from "./notificationHelpers";

// ─── Local hook: ticks at the right cadence ────────────────────────────────
function useLiveTimestamp(ts: string | undefined): string {
  const [label, setLabel] = useState(() => formatTimestamp(ts ?? ""));

  useEffect(() => {
    if (!ts) return;

    const update = () => setLabel(formatTimestamp(ts));
    update(); // sync immediately

    const diffMs = Date.now() - new Date(
      ts.includes("Z") || ts.includes("+") ? ts : ts + "Z"
    ).getTime();
    const secs = Math.floor(diffMs / 1000);

    // Tick every second if < 60 s old, every minute if < 1 h, else no interval
    const ms = secs < 60 ? 1_000 : secs < 3600 ? 60_000 : null;
    if (!ms) return;

    const id = setInterval(update, ms);
    return () => clearInterval(id);
  }, [ts]);

  return label;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface NotificationCardProps {
  notification: Notification;
  onDelete: (id: number) => void;
  onMarkAsRead: (id: number) => void;
}

export function NotificationCard({
  notification: n,
  onDelete,
  onMarkAsRead,
}: NotificationCardProps) {
  const navigate = useNavigate();
  const cfg = getIconConfig(n.type ?? "");
  const Icon = cfg.icon;
  const isRead = n.is_read;
  const isActionRequired = n.is_action_required && !isRead;

  const timeLabel = useLiveTimestamp(n.created_at ?? "");   // ← live label

  let borderColor = "#FFF5F5";
  let cardBg = "#FFF5F5";
  if (isActionRequired) { borderColor = "#FFFBEB"; cardBg = "#FFFBEB"; }
  if (isRead) { borderColor = "transparent"; cardBg = "#FFFFFF"; }

  return (
    <div
      className={`relative flex items-start gap-4 rounded-xl border p-4 mb-3 transition-all ${
        isRead ? "opacity-60" : ""
      }`}
      style={{
        background: cardBg,
        borderColor: "#E5E7EB",
        borderLeftWidth: 4,
        borderLeftColor: borderColor,
      }}
    >
      <button
        onClick={() => onDelete(n.id)}
        className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors"
        title="Delete notification"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div
        className="shrink-0 flex items-center justify-center rounded-full"
        style={{ width: 48, height: 48, background: cfg.bg }}
      >
        <Icon style={{ width: 22, height: 22, color: cfg.color }} />
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <p className="text-base font-medium text-gray-900">{n.title}</p>
        <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
        <p className="text-xs text-gray-400 mt-1.5">{timeLabel}</p>  {/* ← live */}
        {n.link && (
          <button
            onClick={() => navigate(n.link!)}
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: "#800000" }}
          >
            View <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0 pt-0.5">
        {isActionRequired && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap"
            style={{ background: "#FFD700", color: "#800000" }}
          >
            Action Required
          </span>
        )}
        {!isRead ? (
          <button
            onClick={() => onMarkAsRead(n.id)}
            className="text-xs font-medium px-2.5 py-1 rounded-full border transition-colors hover:bg-[#800000]/5 whitespace-nowrap"
            style={{ borderColor: "#800000", color: "#800000" }}
          >
            Mark as read
          </button>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Check className="h-3 w-3" />
            Read
          </span>
        )}
      </div>
    </div>
  );
}