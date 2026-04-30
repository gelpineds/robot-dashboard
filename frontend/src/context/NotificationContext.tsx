import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  user_id: number;
  type:
    | "delivery_created"
    | "robot_dispatched"
    | "robot_arrived"
    | "delivery_completed"
    | "robot_low_battery"
    | "robot_offline"
    | "delivery_cancelled";
  title: string;
  message: string;
  link: string | null;
  is_action_required: boolean;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:5000";
const POLL_INTERVAL_MS = 30_000;

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Derived — not stored as state so it's always in sync
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Stable ref so socket/interval callbacks always see fresh state
  const notificationsRef = useRef(notifications);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // ── fetchNotifications ──────────────────────────────────────────────────

  const fetchNotifications = async (): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/notifications/`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const responseData = await res.json();
      // Backend returns { notifications: [...], unread_count: ... }
      const data: Notification[] = responseData.notifications || [];
      setNotifications(data); // backend already sorted newest-first
    } catch (err) {
      console.error("[NotificationContext] fetchNotifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── markAsRead ──────────────────────────────────────────────────────────

  const markAsRead = async (id: number): Promise<void> => {
    const previous = notificationsRef.current;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      )
    );

    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
    } catch (err) {
      console.error("[NotificationContext] markAsRead:", err);
      setNotifications(previous); // revert
    }
  };

  // ── markAllAsRead ────────────────────────────────────────────────────────

  const markAllAsRead = async (): Promise<void> => {
    const now = new Date().toISOString();

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at ?? now }))
    );

    try {
      const res = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
    } catch (err) {
      console.error("[NotificationContext] markAllAsRead:", err);
      await fetchNotifications(); // refetch to restore true server state
    }
  };

  // ── deleteNotification ───────────────────────────────────────────────────

  const deleteNotification = async (id: number): Promise<void> => {
    const previous = notificationsRef.current;

    // Optimistic remove
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
    } catch (err) {
      console.error("[NotificationContext] deleteNotification:", err);
      setNotifications(previous); // revert
    }
  };

  // ── Initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── SocketIO — real-time push ────────────────────────────────────────────

  useEffect(() => {
    const socket: Socket = io(API_BASE, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      const token = localStorage.getItem("token");
      if (token) {
        socket.emit("authenticate", { token });
      }
    });

    // Prepend; backend is responsible for deduplication
    socket.on("new_notification", (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    socket.on("connect_error", (err) => {
      console.warn("[NotificationContext] Socket connect error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Fallback polling every 30 s ──────────────────────────────────────────

  useEffect(() => {
    const timer = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
          headers: authHeaders(),
        });
        if (!res.ok) return;

        const { unread_count } = (await res.json()) as { unread_count: number };
        const localUnread = notificationsRef.current.filter((n) => !n.is_read).length;

        if (unread_count !== localUnread) {
          await fetchNotifications();
        }
      } catch (err) {
        console.warn("[NotificationContext] Polling error:", err);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Context value ────────────────────────────────────────────────────────

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}