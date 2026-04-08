import { Bot, MapPin, Clock, Battery } from "lucide-react";

export interface Robot {
  id: string;
  name: string;
  status: string;
  battery: number;
  zone: string;
  lastActive: string;
  model?: string;
  currentDelivery?: string;
  maintenanceLog?: { date: string; note: string }[];
}

interface RobotCardProps {
  robot: Robot;
  onViewDetails: (robot: Robot) => void;
}

const statusStyle: Record<string, { bg: string; color: string; dot: string }> = {
  Online:        { bg: "rgba(22,163,74,0.1)", color: "#15803d", dot: "#16a34a" },
  Charging:      { bg: "rgba(255,215,0,0.15)",  color: "#b8860b", dot: "#FFD700" },
  Offline:       { bg: "#F3F4F6",               color: "#6B7280", dot: "#9CA3AF" },
  "On Delivery": { bg: "#FFD700",               color: "#800000", dot: "#800000" },
};

export function batteryColor(pct: number) {
  if (pct > 50) return "#16a34a";
  if (pct >= 20) return "#d97706";
  return "#dc2626";
}

export function RobotCard({ robot, onViewDetails }: RobotCardProps) {
  const s = statusStyle[robot.status] || statusStyle.Offline;
  const bc = batteryColor(robot.battery);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Avatar + name + status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#800000" }}>
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A1A] leading-tight">{robot.name}</p>
              <p className="text-[10.5px] text-gray-400 mt-0.5 font-mono">{robot.id}</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0" style={{ background: s.bg, color: s.color }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
            {robot.status}
          </span>
        </div>
        {/* Battery */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1 text-[11px] text-gray-500"><Battery className="h-3 w-3" /> Battery</span>
            <span className="text-[11px] font-bold" style={{ color: bc }}>{robot.battery}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${robot.battery}%`, background: bc }} />
          </div>
        </div>
        {/* Zone + last active */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11.5px] text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" style={{ color: "#800000" }} />
            <span className="truncate">{robot.zone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-gray-500">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{robot.lastActive}</span>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex border-t border-gray-100">
        <button onClick={() => onViewDetails(robot)} className="flex-1 py-2.5 text-[11.5px] font-semibold transition-colors hover:bg-red-50" style={{ color: "#800000", borderRight: "1px solid #F3F4F6" }}>
          View Details
        </button>
        <button className="flex-1 py-2.5 text-[11.5px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
          Recall
        </button>
      </div>
    </div>
  );
}