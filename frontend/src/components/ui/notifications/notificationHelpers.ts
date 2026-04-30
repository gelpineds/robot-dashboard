import {
  Bell,
  CheckCircle,
  Package,
  Bot,
  AlertTriangle,
  Settings,
  XCircle,
  BatteryLow,
  WifiOff,
} from "lucide-react";

export interface IconConfig {
  icon: React.ElementType;
  bg: string;
  color: string;
}

export function getIconConfig(type: string): IconConfig {
  if (type.startsWith("delivery_dispatched") || type === "robot_dispatched")
    return { icon: Package, bg: "#FFF5CC", color: "#92400E" };
  if (type.startsWith("delivery_delivered") || type === "delivery_success")
    return { icon: CheckCircle, bg: "#DCFCE7", color: "#16A34A" };
  if (type.startsWith("delivery_failed") || type === "delivery_error")
    return { icon: XCircle, bg: "#FEE2E2", color: "#DC2626" };
  if (type.startsWith("delivery_"))
    return { icon: Package, bg: "#FFF5CC", color: "#800000" };
  if (type === "robot_low_battery")
    return { icon: BatteryLow, bg: "#FEF9C3", color: "#CA8A04" };
  if (type === "robot_offline")
    return { icon: WifiOff, bg: "#FEE2E2", color: "#DC2626" };
  if (type.startsWith("robot_"))
    return { icon: Bot, bg: "#EDE9FE", color: "#7C3AED" };
  if (type === "action_required")
    return { icon: AlertTriangle, bg: "#FEF3C7", color: "#D97706" };
  if (type === "system")
    return { icon: Settings, bg: "#F3F4F6", color: "#6B7280" };
  return { icon: Bell, bg: "#F3F4F6", color: "#6B7280" };
}

export function formatTimestamp(ts: string | Date): string {
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (isNaN(d.getTime())) return String(ts);
  return d
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", " ·")
    .replace(" at", " ·");
}
