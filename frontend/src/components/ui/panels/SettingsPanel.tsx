import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  User,
  Lock,
  LogOut,
  ChevronRight,
  Shield,
} from "lucide-react";
import { UserData } from "@/hooks/useUser";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  user: UserData | null;
  triggerRef?: React.RefObject<HTMLDivElement>;
}

const SETTINGS_OPTIONS = [
  { icon: User, label: "Profile", description: "Account information", path: "/settings" },
];

export function SettingsPanel({ open, onClose, user, triggerRef }: SettingsPanelProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Close if click is outside panel AND outside trigger button
      if (panelRef.current && !panelRef.current.contains(target)) {
        if (triggerRef?.current && !triggerRef.current.contains(target)) {
          onClose();
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  // Get user initials
  const getInitials = () => {
    if (!user) return "U";
    const parts = user.full_name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    navigate("/login");
    onClose();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const options = user?.role === "admin"
    ? [...SETTINGS_OPTIONS, { icon: Shield, label: "Admin Panel", description: "Manage users, robots, and queueing", path: "/admin" }]
    : SETTINGS_OPTIONS;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-50 w-[280px] rounded-2xl border border-gray-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#800000]"
          >
            <span className="text-white text-xs font-bold">{getInitials()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{user?.full_name || "User"}</p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email || "user@pup.edu.ph"}</p>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="max-h-[360px] overflow-y-auto">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.label}
              onClick={() => handleNavigate(option.path)}
              className="w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-50 last:border-b-0 text-left hover:bg-gray-50"
            >
              {/* Icon */}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-[#FFF5F5]"
              >
                <Icon className="h-4 w-4 text-[#800000]" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#1A1A1A]">{option.label}</p>
                <p className="text-[11px] text-gray-500 truncate">{option.description}</p>
              </div>

              {/* Chevron */}
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="border-t border-gray-100 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-colors bg-[#FFE5E5] text-[#800000] hover:bg-[#FFC9C9]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
