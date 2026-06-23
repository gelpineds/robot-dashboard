import { Robot, batteryColor } from "../drawers/DetailDrawer";

interface RobotTableProps {
  robots: Robot[];
  onViewDetails: (r: Robot) => void;
}

export function RobotTable({ robots, onViewDetails }: RobotTableProps) {
  const statusStyle: Record<string, { bg: string; color: string }> = {
    Online: { bg: "rgba(22,163,74,0.1)", color: "#15803d" },
    Charging: { bg: "rgba(255,215,0,0.15)", color: "#b8860b" },
    Offline: { bg: "#F3F4F6", color: "#6B7280" },
    "On Delivery": { bg: "#FFD700", color: "#800000" },
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: "#800000" }}>
            {["Robot ID", "Name", "Status", "Battery %", "Zone", "Last Active", "Actions"].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-white tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {robots.map((robot, i) => {
            const s = statusStyle[robot.status] || statusStyle.Offline;
            const bc = batteryColor(robot.battery);
            return (
              <tr key={robot.id} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB" }} className="hover:bg-red-50/20 transition-colors">
                <td className="px-4 py-3 font-mono text-[11px] font-semibold" style={{ color: "#800000" }}>{robot.id}</td>
                <td className="px-4 py-3 text-[12px] font-medium text-[#1A1A1A]">{robot.name}</td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>{robot.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${robot.battery}%`, background: bc }} />
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: bc }}>{robot.battery}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-gray-500">{robot.zone}</td>
                <td className="px-4 py-3 text-[11px] text-gray-400">{robot.lastActive}</td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => onViewDetails(robot)} 
                    className="text-[11px] font-semibold px-3 py-1 rounded-lg border transition-colors hover:bg-red-50" 
                    style={{ color: "#800000", borderColor: "#800000" }}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
