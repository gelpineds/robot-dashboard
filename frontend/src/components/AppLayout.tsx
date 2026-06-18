// src/components/AppLayout.tsx
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Search, Settings } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationPanel } from "@/components/ui/panels/NotificationPanel";
import { SettingsPanel } from "@/components/ui/panels/SettingsPanel";
import { useNotifications } from "@/context/NotificationContext";
import { useUser } from "@/hooks/useUser";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const routeTitles: Record<string, string> = {
  "/":              "Dashboard",
  "/history":       "Deliveries",
  "/robots":        "Robot Fleet",
  "/request":       "Request Delivery",
  "/inbox":         "Delivery Inbox",
  "/documents":     "Documents",
  "/settings":      "Settings",
  "/admin":         "Admin Panel",
  "/track":         "Track Delivery",
  "/notifications": "Notifications",
};

export function AppLayout({ children, title }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user, getInitials } = useUser();
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const location = useLocation();
  const bellRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const { notifications, markAllAsRead, markAsRead } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const hasActionRequired = notifications.some(
    (n) => !n.is_read && n.is_action_required
  );

  const pageTitle = title ?? routeTitles[location.pathname] ?? "PUP Deliver";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
      <AppSidebar />

      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ marginLeft: "64px" }}
      >
        {/* Top navbar */}
        <header className="h-16 flex items-center justify-between gap-4 bg-white border-b border-gray-200 px-6 shrink-0">
          {/* Page title */}
          <div className="shrink-0">
            <h1 className="text-[15px] font-semibold text-[#1A1A1A] leading-none tracking-tight">
              {pageTitle}
            </h1>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bell + NotificationPanel */}
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span
                    className={`absolute top-0 right-0 w-2 h-2 rounded-full bg-[#FFD700] ${
                      hasActionRequired ? "animate-pulse" : ""
                    }`}
                  />
                )}
              </button>

              <NotificationPanel
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                bellRef={bellRef}
              />
            </div>

            {/* Settings */}
            <div ref={settingsRef} className="relative">
              <button
                onClick={() => setSettingsPanelOpen((o) => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-[18px] w-[18px]" />
              </button>
              <SettingsPanel
                open={settingsPanelOpen}
                onClose={() => setSettingsPanelOpen(false)}
                user={user}
                triggerRef={settingsRef}
              />
            </div>

            {/* Avatar */}
            <button
              onClick={() => navigate("/settings")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ml-1 hover:opacity-90 transition-all hover:shadow-lg hover:scale-105"
              style={{ background: "#800000" }}
              title="Go to profile settings"
            >
              {getInitials()}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}