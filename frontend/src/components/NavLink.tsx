import { NavLink as RouterNavLink } from "react-router-dom";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavLinkProps {
  icon: LucideIcon;
  label: string;
  to: string;
  collapsed: boolean;
  end?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ icon: Icon, label, to, collapsed, end = false }, ref) => {
    const [tooltipVisible, setTooltipVisible] = useState(false);

    return (
      <div className="relative">
        <RouterNavLink
          ref={ref}
          to={to}
          end={end}
          onMouseEnter={() => collapsed && setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium group relative",
              collapsed ? "justify-center px-0 w-10 mx-auto" : "w-full",
              isActive
                ? "bg-white/15 text-white border-l-2 border-[#FFD700]"
                : "text-white/70 hover:bg-white/10 hover:text-white border-l-2 border-transparent"
            )
          }
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="truncate">{label}</span>}
        </RouterNavLink>

        {/* Tooltip for collapsed mode */}
        {collapsed && tooltipVisible && (
          <div
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none"
          >
            <div className="bg-[#1A1A1A] text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
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