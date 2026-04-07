import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search, Settings } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const routeTitles: Record<string, string> = {
  "/":          "Dashboard",
  "/history":   "Deliveries",
  "/robots":    "Robot Fleet",
  "/request":   "Request Delivery",
  "/documents": "Documents",
  "/settings":  "Settings",
  "/track":     "Track Delivery",
};

export function AppLayout({ children, title }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  const pageTitle = title ?? routeTitles[location.pathname] ?? "PUP Deliver";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navbar */}
        <header className="h-16 flex items-center justify-between gap-4 bg-white border-b border-gray-200 px-6 shrink-0">
          {/* Left: page title */}
          <div className="shrink-0">
            <h1 className="text-[15px] font-semibold text-[#1A1A1A] leading-none tracking-tight">
              {pageTitle}
            </h1>
          </div>

          {/* Center: search */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search deliveries, robots…"
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 transition-all placeholder:text-gray-400 text-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Right: actions + avatar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="h-[18px] w-[18px]" />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white"
                style={{ background: "#FFD700" }}
              />
            </button>

            {/* Settings */}
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Settings className="h-[18px] w-[18px]" />
            </button>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ml-1"
              style={{ background: "#800000" }}
            >
              AD
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}