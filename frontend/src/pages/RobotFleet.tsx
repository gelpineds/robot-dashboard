import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { RobotCard } from "@/components/RobotCard";
import { DetailDrawer, Robot, batteryColor } from "@/components/ui/drawers";
import { RobotTable } from "@/components/ui/tables";
import { Popover, PopoverContent, PopoverTrigger, HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/utilities";
import {
  Plus, Search, Bot, Wifi, WifiOff,
  LayoutGrid, List, X, Battery, MapPin, Clock, Loader, MoreVertical,
} from "lucide-react";
import { robotsAPI } from "@/lib/api";

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
            { icon: Bot,     label: "Total Robots", value: ROBOTS.length, accent: "#800000", help: "Total number of delivery robots in the fleet" },
            { icon: Wifi,    label: "Online",        value: totalOnline,   accent: "#16a34a", help: "Robots currently online and available" },
            { icon: WifiOff, label: "Offline",       value: totalOffline,  accent: "#6B7280", help: "Robots currently offline or charging" },
          ].map(({ icon: Icon, label, value, accent, help }) => (
            <HoverCard key={label}>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm cursor-help">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <div>
                    <p className="text-[20px] font-bold text-[#1A1A1A] leading-none">{value}</p>
                    <p className="text-[10.5px] text-gray-500 mt-0.5">{label}</p>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 text-xs">
                <p>{help}</p>
              </HoverCardContent>
            </HoverCard>
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