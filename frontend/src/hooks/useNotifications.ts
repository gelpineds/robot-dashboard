import { useState, useCallback } from "react";

export type NotificationType = "delivery" | "robot" | "system" | "success" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "success",
    title: "Delivery #DEL-20251 completed",
    description: "PUP-BOT Unit 3 successfully delivered to Lagoon Area. Package received and confirmed.",
    timestamp: "2 mins ago",
    read: false,
  },
  {
    id: "n2",
    type: "robot",
    title: "PUP-BOT Unit 5 — Low Battery",
    description: "Unit 5 battery level has dropped to 12%. Please return to charging station immediately.",
    timestamp: "8 mins ago",
    read: false,
  },
  {
    id: "n3",
    type: "delivery",
    title: "New delivery request submitted",
    description: "Request #DEL-20252 from College of Engineering to Main Library. Awaiting dispatch.",
    timestamp: "15 mins ago",
    read: false,
  },
  {
    id: "n4",
    type: "robot",
    title: "PUP-BOT Unit 2 — Offline",
    description: "Unit 2 has gone offline unexpectedly near Gate 3. Diagnostics required before next deployment.",
    timestamp: "32 mins ago",
    read: false,
  },
  {
    id: "n5",
    type: "system",
    title: "Scheduled system maintenance",
    description: "PUP Deliver will undergo maintenance on Saturday, April 12 from 2:00–4:00 AM. Expect brief downtime.",
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: "n6",
    type: "error",
    title: "Delivery #DEL-20248 failed",
    description: "PUP-BOT Unit 1 could not complete delivery to Alumni Center. Obstacle detected on route.",
    timestamp: "2 hours ago",
    read: true,
  },
  {
    id: "n7",
    type: "success",
    title: "Delivery #DEL-20247 completed",
    description: "PUP-BOT Unit 4 delivered to Graduate School Office. Delivery time: 4 mins 32 secs.",
    timestamp: "3 hours ago",
    read: true,
  },
  {
    id: "n8",
    type: "system",
    title: "New admin account created",
    description: "A new system administrator account has been provisioned. Review access permissions in Settings.",
    timestamp: "Yesterday",
    read: true,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, markRead, markAllRead, clearAll };
}