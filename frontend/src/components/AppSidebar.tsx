import { useState } from "react";
import {
  LayoutDashboard,
  PackageSearch,
  Bot,
  PlusCircle,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",        to: "/",                end: true },
  { icon: PackageSearch,   label: "Deliveries",       to: "/history" },
  { icon: Bot,             label: "Robot Fleet",      to: "/robots" },
  { icon: PlusCircle,      label: "Request Delivery", to: "/request" },
  { icon: FileText,        label: "Documents",        to: "/documents" },
  { icon: Settings,        label: "Settings",         to: "/settings" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  return (
    <aside
      className="relative flex flex-col h-screen shrink-0 transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 64 : 240,
        background: "#800000",
      }}
    >
      {/* Collapse toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] z-50 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors hover:bg-[#FFD700]/90"
        style={{ background: "#FFD700" }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-[#600000]" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-[#600000]" />
        )}
      </button>

      {/* Logo / Brand */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 transition-all duration-300 ${
          collapsed ? "justify-center px-0" : ""
        }`}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
          style={{ background: "#600000", color: "#FFD700" }}
        >
          PD
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-semibold text-sm leading-tight tracking-wide truncate">
              PUP Deliver
            </p>
            <p className="text-[11px] leading-tight truncate" style={{ color: "rgba(255,215,0,0.7)" }}>
             Panel
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 overflow-y-auto overflow-x-hidden ${collapsed ? "px-0" : "px-3"}`}>
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              collapsed={collapsed}
              end={item.end}
            />
          ))}
        </div>
      </nav>

      {/* Admin profile footer */}
      <div
        className={`border-t border-white/10 p-3 flex items-center gap-3 transition-all duration-300 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ background: "#600000", color: "#FFD700" }}
        >
          AD
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[12.5px] font-medium leading-tight truncate">Admin</p>
              <p className="text-white/50 text-[10px] truncate mt-0.5">System Admin</p>
            </div>
            <button
              className="shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" style={{ color: "#FFD700" }} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}