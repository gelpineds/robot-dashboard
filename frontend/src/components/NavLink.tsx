import { NavLink as RouterNavLink } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavLinkProps {
  icon: LucideIcon;
  label: string;
  to: string;
  end?: boolean;
  isExpanded: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ icon: Icon, label, to, end = false, isExpanded }, ref) => {
    return (
      <div className="relative" style={{ pointerEvents: isExpanded ? "auto" : "auto" }}>
        <RouterNavLink
          ref={ref}
          to={to}
          end={end}
          title={isExpanded ? undefined : label}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 text-sm font-medium overflow-hidden",
              isActive
                ? "bg-white/15 text-white border-l-2 border-[#FFD700]"
                : "text-white/70 hover:bg-white/10 hover:text-white border-l-2 border-transparent"
            )
          }
        >
          {/* Icon — pointerEvents none so mouse movement over it doesn't bubble */}
          <Icon
            className="h-5 w-5 shrink-0"
            style={{ pointerEvents: "none" }}
          />

          {/* Label — pointerEvents none, max-width transition for smooth expand */}
          <span
            style={{
              opacity: isExpanded ? 1 : 0,
              maxWidth: isExpanded ? 160 : 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 180ms ease, max-width 180ms ease",
              pointerEvents: "none", // CRITICAL — no mouse events on text
              userSelect: "none",
              display: "inline-block",
            }}
          >
            {label}
          </span>
        </RouterNavLink>

        {/* Tooltip shown only when sidebar is collapsed */}
        {!isExpanded && (
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none"
            style={{ pointerEvents: "none" }}
          >
            <div className="bg-[#1A1A1A] text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100">
              {label}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1A1A1A]" />
            </div>
          </div>
        )}
      </div>
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };