import { X, Battery } from "lucide-react";

export type Robot = {
  id: string;
  name: string;
  status: string;
  battery: number;
  zone: string;
  lastActive: string;
  model?: string;
  currentDelivery?: string;
  maintenanceLog?: Array<{ note: string; date: string }>;
};

export function batteryColor(battery: number): string {
  if (battery >= 60) return "#15803d";
  if (battery >= 30) return "#d97706";
  return "#dc2626";
}

interface DetailDrawerProps {
  robot: Robot;
  onClose: () => void;
}

export function DetailDrawer({ robot, onClose }: DetailDrawerProps) {
  const bc = batteryColor(robot.battery);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[360px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200" style={{ background: "#800000" }}>
          <div>
            <p className="text-white font-semibold text-sm">{robot.name}</p>
            <p className="text-white/60 text-[11px] font-mono mt-0.5">{robot.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Robot photo placeholder */}
          <div className="flex items-center justify-center" style={{ background: "#800000", height: 160 }}>
            <div className="text-white/40 text-4xl">🤖</div>
          </div>

          <div className="p-5 space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Model", value: robot.model ?? "—" },
                { label: "Status", value: robot.status },
                { label: "Zone", value: robot.zone },
                { label: "Last Active", value: robot.lastActive },
              ].map((row) => (
                <div key={row.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{row.label}</p>
                  <p className="text-[12.5px] font-semibold text-[#1A1A1A] truncate">{row.value}</p>
                </div>
              ))}
            </div>

            {/* Battery gauge */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                  <Battery className="h-3.5 w-3.5" /> Battery Level
                </span>
                <span className="text-sm font-bold" style={{ color: bc }}>{robot.battery}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${robot.battery}%`, background: bc }} />
              </div>
              {robot.battery < 20 && (
                <p className="text-[10.5px] text-red-600 font-medium mt-2">⚠ Low battery — please recharge soon</p>
              )}
            </div>

            {/* Current delivery */}
            {robot.currentDelivery && (
              <div className="rounded-lg p-4 border" style={{ background: "rgba(255,215,0,0.08)", borderColor: "rgba(255,215,0,0.4)" }}>
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: "#92400e" }}>Current Delivery</p>
                <p className="text-[12.5px] font-semibold text-[#1A1A1A]">{robot.currentDelivery}</p>
              </div>
            )}

            {/* Maintenance log */}
            <div>
              <p className="text-[12px] font-semibold text-[#1A1A1A] mb-3">Maintenance Log</p>
              {robot.maintenanceLog && robot.maintenanceLog.length > 0 ? (
                <div className="space-y-2.5">
                  {robot.maintenanceLog.map((entry, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: "#800000" }} />
                      <div>
                        <p className="text-[11.5px] text-[#1A1A1A]">{entry.note}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{entry.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-gray-400">No maintenance records.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
