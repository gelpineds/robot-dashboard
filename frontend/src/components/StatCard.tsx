import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  pulse?: boolean;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, pulse, trend, trendUp }: StatCardProps) {
  return (
    <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200 p-5 shadow-sm">

      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Label */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500 mb-3">
            {title}
          </p>

          {/* Value + live indicator */}
          <div className="flex items-end gap-2.5">
            <p className="text-[36px] leading-none font-bold text-[#1A1A1A]">{value}</p>
            {pulse && (
              <div className="flex items-center gap-1.5 mb-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">Live</span>
              </div>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div
              className={`mt-2 flex items-center gap-1 text-[11.5px] font-medium ${
                trendUp === true
                  ? "text-green-700"
                  : trendUp === false
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {trendUp !== undefined && (
                <span>{trendUp ? "↑" : "↓"}</span>
              )}
              {trend}
            </div>
          )}
        </div>

        {/* Icon badge */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        >
          <Icon className="h-5 w-5" style={{ color: "#800000" }} />
        </div>
      </div>
    </div>
  );
}