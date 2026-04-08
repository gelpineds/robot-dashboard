import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { RobotCard, type Robot, batteryColor } from "@/components/RobotCard";
import {
  Plus, Search, Bot, Wifi, WifiOff,
  LayoutGrid, List, X, Battery, MapPin, Clock, Loader,
} from "lucide-react";
import { robotsAPI } from "@/lib/api";

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ robot, onClose }: { robot: Robot; onClose: () => void }) {
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
            <Bot className="h-16 w-16 text-white/40" />
          </div>

          <div className="p-5 space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Model",  value: robot.model ?? "—" },
                { label: "Status", value: robot.status },
                { label: "Zone",   value: robot.zone },
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
                <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium"><Battery className="h-3.5 w-3.5" /> Battery Level</span>
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

// ─── Table view ───────────────────────────────────────────────────────────────
function RobotTable({ robots, onViewDetails }: { robots: Robot[]; onViewDetails: (r: Robot) => void }) {
  const statusStyle: Record<string, { bg: string; color: string }> = {
    Online:        { bg: "rgba(22,163,74,0.1)", color: "#15803d" },
    Charging:      { bg: "rgba(255,215,0,0.15)", color: "#b8860b" },
    Offline:       { bg: "#F3F4F6",              color: "#6B7280" },
    "On Delivery": { bg: "#FFD700",              color: "#800000" },
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
                  <button onClick={() => onViewDetails(robot)} className="text-[11px] font-semibold px-3 py-1 rounded-lg border transition-colors hover:bg-red-50" style={{ color: "#800000", borderColor: "#800000" }}>
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RobotFleet() {
  // Fetch robots from backend
  const { data: backendRobots = [], isLoading, error } = useQuery({
    queryKey: ['robots'],
    queryFn: robotsAPI.getAll,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // All hooks MUST be called here, before any conditional returns
  const [viewMode,       setViewMode]       = useState<"grid" | "table">("grid");
  const [selectedRobot,  setSelectedRobot]  = useState<Robot | null>(null);
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("All");
  const [zoneFilter,     setZoneFilter]     = useState("All Zones");

  // Transform backend data to match component types
  const ROBOTS: Robot[] = (backendRobots || []).map((r: any) => ({
    id: `PUPBOT-${String(r.id).padStart(3, '0')}`,
    name: r.name,
    status: r.status === 'online' ? 'Online' : r.status === 'charging' ? 'Charging' : 'Offline',
    battery: r.battery_level || 0,
    zone: r.location || 'Unknown',
    lastActive: 'Recently',
    model: 'DelivBot X2',
    currentDelivery: '',
    maintenanceLog: [],
  }));

  // Build zones list from robots
  const ZONES = ["All Zones", ...Array.from(new Set(ROBOTS.map((r) => r.zone)))];

  const totalOnline = ROBOTS.filter((r) => r.status !== "Offline").length;
  const totalOffline = ROBOTS.filter((r) => r.status === "Offline").length;

  const filtered = useMemo(() => {
    return ROBOTS.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      const matchZone   = zoneFilter   === "All Zones" || r.zone.includes(zoneFilter);
      return matchSearch && matchStatus && matchZone;
    });
  }, [search, statusFilter, zoneFilter]);

  // Loading state
  if (isLoading) {
    return (
      <AppLayout title="Robot Fleet">
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Robot Fleet">
        <div className="text-center text-destructive py-8">
          <p>Failed to load robots. Please try again.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Robot Fleet">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-gray-500 mt-0.5">Manage and monitor all delivery robots</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12.5px] font-semibold transition-colors hover:opacity-90"
            style={{ background: "#800000", color: "#FFD700" }}
          >
            <Plus className="h-4 w-4" />
            Add Robot
          </button>
        </div>

        {/* ── Stat chips ── */}
        <div className="flex gap-4 flex-wrap">
          {[
            { icon: Bot,     label: "Total Robots", value: ROBOTS.length, accent: "#800000" },
            { icon: Wifi,    label: "Online",        value: totalOnline,   accent: "#16a34a" },
            { icon: WifiOff, label: "Offline",       value: totalOffline,  accent: "#6B7280" },
          ].map(({ icon: Icon, label, value, accent }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm"
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
              <div>
                <p className="text-[20px] font-bold text-[#1A1A1A] leading-none">{value}</p>
                <p className="text-[10.5px] text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + filters + view toggle ── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#800000] text-gray-600"
          >
            {["All", "Online", "Offline", "On Delivery"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {/* Zone filter */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#800000] text-gray-600"
          >
            {ZONES.map((z) => <option key={z}>{z}</option>)}
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            <button
              onClick={() => setViewMode("grid")}
              className="p-2.5 transition-colors"
              style={viewMode === "grid" ? { background: "#800000", color: "#FFD700" } : { color: "#6B7280" }}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className="p-2.5 transition-colors"
              style={viewMode === "table" ? { background: "#800000", color: "#FFD700" } : { color: "#6B7280" }}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Results count ── */}
        <p className="text-[12px] text-gray-400">
          Showing <span className="font-semibold text-[#1A1A1A]">{filtered.length}</span> of {ROBOTS.length} robots
        </p>

        {/* ── Grid / Table ── */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((robot) => (
              <RobotCard key={robot.id} robot={robot} onViewDetails={setSelectedRobot} />
            ))}
          </div>
        ) : (
          <RobotTable robots={filtered} onViewDetails={setSelectedRobot} />
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Bot className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No robots match your filters.</p>
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      {selectedRobot && (
        <DetailDrawer robot={selectedRobot} onClose={() => setSelectedRobot(null)} />
      )}
    </AppLayout>
  );
}