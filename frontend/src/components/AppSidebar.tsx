import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PackageSearch,
  Bot,
  PlusCircle,
  Inbox,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useUser } from "@/hooks/useUser";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",        to: "/",        end: true },
  { icon: PackageSearch,   label: "Deliveries",       to: "/history" },
  { icon: Bot,             label: "Robot Fleet",      to: "/robots" },
  { icon: PlusCircle,      label: "Request Delivery", to: "/request" },
  { icon: Inbox,           label: "Delivery Inbox",   to: "/delivery-inbox" },
  { icon: FileText,        label: "Documents",        to: "/documents" },
  { icon: Settings,        label: "Settings",         to: "/settings" },
];

// Shared style for any label/text that should not receive mouse events
const labelStyle = (expanded: boolean): React.CSSProperties => ({
  opacity: expanded ? 1 : 0,
  maxWidth: expanded ? 200 : 0,
  marginLeft: expanded ? 10 : 0,
  overflow: "hidden",
  whiteSpace: "nowrap",
  transition: "opacity 200ms ease, max-width 200ms ease, margin 200ms ease",
  pointerEvents: "none", // CRITICAL — prevents child mouseleave from firing on the root
  userSelect: "none",
  display: "inline-block",
  flexShrink: 0,
});

export function AppSidebar() {
  const navigate = useNavigate();
  const { user, getInitials } = useUser();

  const sidebarRef = useRef<HTMLElement>(null);
  const isHovered = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Attach DOM-level mouseenter/mouseleave ONCE to the real DOM node.
  // Empty deps = these listeners never re-attach on re-renders or route changes.
  // NO location.pathname effect — route changes must never touch isExpanded.
  // Only the mouse physically crossing the sidebar boundary can change state.
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const handleEnter = () => {
      isHovered.current = true;
      setIsExpanded(true);
    };
    const handleLeave = () => {
      isHovered.current = false;
      setIsExpanded(false);
    };

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []); // ← EMPTY DEPS ONLY. Nothing else touches isExpanded.

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    navigate("/login", { replace: true });
  };

  return (
    <aside
      ref={sidebarRef}
      style={{ width: isExpanded ? 240 : 64 }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-[#800000] transition-[width] duration-300 ease-in-out overflow-hidden shrink-0"
    >
      {/* Logo / Brand — pointerEvents none on all child text */}
      <div
        className="flex items-center px-3 py-5 border-b border-white/10 shrink-0"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
          style={{ background: "#600000", color: "#FFD700", pointerEvents: "none" }}
        >
          PD
        </div>
        <div style={labelStyle(isExpanded)}>
          <p className="text-white font-semibold text-sm leading-tight tracking-wide">
            PUP Deliver
          </p>
          <p className="text-[11px] leading-tight" style={{ color: "rgba(255,215,0,0.7)" }}>
            Panel
          </p>
        </div>
      </div>

      {/* Navigation — overflow hidden, pointerEvents restored only on NavLink anchors */}
      <nav
        className="flex-1 py-4 overflow-y-auto overflow-x-hidden"
        style={{ overflowX: "hidden" }}
      >
        <div className="flex flex-col gap-0.5 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              end={item.end}
              isExpanded={isExpanded}
            />
          ))}
        </div>
      </nav>

      {/* User profile footer */}
      <div
        className="border-t border-white/10 p-3 flex items-center shrink-0 cursor-pointer hover:bg-white/5"
        onClick={() => navigate("/settings")}
        title="Go to profile settings"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ background: "#FFD700", color: "#800000", pointerEvents: "none" }}
        >
          {getInitials()}
        </div>

        {/* Label area — pointerEvents none so it can't trigger mouseleave */}
        <div
          style={{
            ...labelStyle(isExpanded),
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: isExpanded ? "100%" : 0,
            maxWidth: isExpanded ? "100%" : 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0, pointerEvents: "none" }}>
            <p className="text-white text-[12.5px] font-medium leading-tight truncate">
              {user?.full_name || "User"}
            </p>
            <p className="text-white/50 text-[10px] truncate mt-0.5">
              {user?.email || "user@pup.edu.ph"}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Log out"
            title="Log out"
            style={{ pointerEvents: isExpanded ? "auto" : "none" }}
          >
            <LogOut className="h-4 w-4" style={{ color: "#FFD700", pointerEvents: "none" }} />
          </button>
        </div>
      </div>
    </aside>
  );
}