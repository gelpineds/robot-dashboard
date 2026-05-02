import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  User,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { UserData } from "@/hooks/useUser";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  user: UserData | null;
}

const SETTINGS_OPTIONS = [
  { icon: Settings, label: "Settings", description: "System preferences", path: "/settings" },
  { icon: User, label: "Profile", description: "Account information", path: "/settings" },
  { icon: Lock, label: "Privacy & Security", description: "Security settings", path: "/settings" },
];

export function SettingsPanel({ open, onClose, user }: SettingsPanelProps) {
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    navigate("/login");
    onClose();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-50"
      style={{
        width: 280,
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #E5E7EB",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 32, height: 32, background: "#800000" }}
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
      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        {SETTINGS_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.label}
              onClick={() => handleNavigate(option.path)}
              className="w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-50 last:border-b-0 text-left hover:bg-gray-50"
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{ width: 36, height: 36, background: "#FFF5F5" }}
              >
                <Icon style={{ width: 16, height: 16, color: "#800000" }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#1A1A1A]">{option.label}</p>
                <p className="text-[11px] text-gray-500 truncate">{option.description}</p>
              </div>

              {/* Chevron */}
              <ChevronRight style={{ width: 16, height: 16, color: "#9CA3AF" }} className="shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="border-t border-gray-100 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
          style={{ background: "#FFE5E5", color: "#800000" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FFC9C9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#FFE5E5")}
        >
          <LogOut style={{ width: 16, height: 16 }} />
          Logout
        </button>
      </div>
    </div>
  );
}
