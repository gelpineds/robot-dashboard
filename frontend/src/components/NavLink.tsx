import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavLinkProps {
  icon: LucideIcon;
  label: string;
  to: string;
  end?: boolean;
  isExpanded: boolean;
}

export function NavLink({ icon: Icon, label, to, end = false, isExpanded }: NavLinkProps) {
  return (
    // group enables the CSS hover for the tooltip
    <div className="relative group">
      <RouterNavLink
        to={to}
        end={end}
        title={isExpanded ? undefined : label}
        className={({ isActive }) =>
          cn(
            "flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150 overflow-hidden",
            isActive
              ? "bg-white/15 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )
        }
      >
        {/* Icon — always visible, always same left position, never receives mouse events */}
        <Icon
          className="h-5 w-5 shrink-0"
          style={{ pointerEvents: 'none' }}
        />

        {/* Label — fades + expands in when sidebar is expanded */}
        <span
          style={{
            opacity: isExpanded ? 1 : 0,
            maxWidth: isExpanded ? '160px' : 0,
            marginLeft: isExpanded ? '12px' : 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: 'opacity 200ms ease, max-width 200ms ease, margin-left 200ms ease',
            pointerEvents: 'none', // CRITICAL — must never receive mouse events
            userSelect: 'none',
            display: 'inline-block',
            flexShrink: 0,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      </RouterNavLink>

      {/* Tooltip — only shown in collapsed state via group-hover */}
      {!isExpanded && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none
                     opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        >
          <div className="bg-[#1A1A1A] text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
            {label}
            {/* Left-pointing arrow */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1A1A1A]" />
          </div>
        </div>
      )}
    </div>
  );
}