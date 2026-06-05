import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { HistoryTable, type HistoryRow, STATUS_STYLES } from "@/components/DeliveryTable";
import { DeliveryDetailsModal } from "@/components/DeliveryDetailsModal";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/utilities";
import { Download, Search, Bot, ChevronLeft, ChevronRight, Loader, Info } from "lucide-react";
import { deliveriesAPI, robotsAPI } from "@/lib/api";
import { formatDateOnly } from "@/hooks/useTimeAgo";

// ─── CSV export helper ────────────────────────────────────────────────────────
function exportCSV(rows: HistoryRow[]) {
  const headers = ["Delivery ID", "Sender", "Robot", "From", "To", "Date & Time", "Status"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.id, `"${r.customer}"`, `"${r.robot}"`, `"${r.from}"`, `"${r.to}"`, `"${r.datetime}"`, r.status].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "delivery-history.csv"; a.click();
  URL.revokeObjectURL(url);
}

const STATUSES = ["All", "In Transit", "Pending", "Delivered", "Failed"];
const PAGE_SIZE = 8;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DeliveryHistory() {
  // All hooks MUST be called before any conditional returns (rules of hooks)
  const [search,        setSearch]        = useState("");
  const [status,        setStatus]        = useState("All");
  const [robot,         setRobot]         = useState("All Robots");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [page,          setPage]          = useState(1);
  const [selectedDelivery, setSelectedDelivery] = useState<HistoryRow | null>(null);
  const [modalOpen,     setModalOpen]     = useState(false);

  // Fetch deliveries and robots from backend
  const { data: backendDeliveries = [], isLoading, error } = useQuery({
    queryKey: ['deliveries-my-requests'],
    queryFn: deliveriesAPI.getMyRequests,
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 3,
  });

  const { data: backendRobots = [] } = useQuery({
    queryKey: ['robots'],
    queryFn: robotsAPI.getAll,
    refetchInterval: 5000,
    retry: 3,
  });



  // Build robot list
  const ROBOTS = ["All Robots", ...backendRobots.map((r: any) => r.name)];

  // Transform backend data to match component types
  const ALL_DELIVERIES: HistoryRow[] = (backendDeliveries || []).map((d: any) => ({
    id: `DEL-${String(d.id).padStart(5, '0')}`,
    customer: d.sender || 'Unknown', 
    robot: d.robot_id ? `PUP-BOT Unit ${d.robot_id}` : 'Unassigned',
    from: d.pickup_location || 'Unknown',
    to: d.dropoff_location || 'Unknown',
    datetime: formatDateOnly(d.created_at),
    status: d.status === 'pending_request' ? 'Pending' : d.status === 'robot_assigned' ? 'Pending' : d.status === 'dispatched' ? 'In Transit' : d.status === 'arrived' ? 'In Transit' : d.status === 'received' ? 'Delivered' : d.status,
  }));

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const filtered = useMemo(() => {
    return ALL_DELIVERIES.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.id.toLowerCase().includes(q) || d.customer.toLowerCase().includes(q);
      const matchStatus = status === "All" || d.status === status;
      const matchRobot  = robot  === "All Robots" || d.robot === robot;
      return matchSearch && matchStatus && matchRobot;
    });
  }, [search, status, robot, dateFrom, dateTo, ALL_DELIVERIES]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status, robot, dateFrom, dateTo]);

  // NOW we can do conditional early returns
  if (isLoading) {
    return (
      <AppLayout title="Delivery History">
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Delivery History">
        <div className="text-center text-destructive py-8">
          <p>Failed to load delivery history.</p>
          <p className="text-sm mt-2">{error?.message || 'Unknown error'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#800000] text-white rounded hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const countByStatus = (s: string) => filtered.filter((d) => d.status === s).length;

  return (
    <AppLayout title="Delivery History">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-gray-500">All delivery records</p>
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12.5px] font-semibold transition-colors hover:opacity-90"
            style={{ background: "#FFD700", color: "#800000" }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          {/* Row 1: search + robot + dates */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order ID or customer name…"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 transition-all placeholder:text-gray-400"
              />
            </div>
            {/* Robot dropdown */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <select
                  value={robot}
                  onChange={(e) => setRobot(e.target.value)}
                  className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#800000] text-gray-600 min-w-[160px] cursor-help"
                >
                  {ROBOTS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 text-xs">
                <p>Filter deliveries by the robot that handled them. Select "All Robots" to see all deliveries.</p>
              </HoverCardContent>
            </HoverCard>
            {/* Date range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 text-gray-600"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10 text-gray-600"
              />
            </div>
          </div>

          {/* Row 2: status pills */}
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const active = status === s;
              const sc = STATUS_STYLES[s];
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className="px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold transition-all border"
                  style={
                    active
                      ? { background: "#800000", color: "#FFD700", borderColor: "#800000" }
                      : sc
                      ? { background: sc.bg, color: sc.color, borderColor: "transparent" }
                      : { background: "#F3F4F6", color: "#6B7280", borderColor: "transparent" }
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Summary strip ── */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Showing",    value: filtered.length, dot: "#800000" },
            { label: "Completed",  value: countByStatus("Completed"),  dot: "#16a34a" },
            { label: "In Transit", value: countByStatus("In Transit"), dot: "#d97706" },
            { label: "Failed",     value: countByStatus("Failed"),     dot: "#ef4444" },
          ].map(({ label, value, dot }) => (
            <div key={label} className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3.5 py-2 shadow-sm">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
              <span className="text-[12px] font-bold text-[#1A1A1A]">{value}</span>
              <span className="text-[11px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Table or empty state ── */}
        {paginated.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <HistoryTable
              data={paginated}
              onView={(row) => {
                setSelectedDelivery(row);
                setModalOpen(true);
              }}
            />
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
              <p className="text-[12px] text-gray-400">
                Showing <span className="font-semibold text-[#1A1A1A]">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-[#1A1A1A]">{filtered.length}</span> results
              </p>
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                    if (idx > 0 && (arr[idx - 1] as number) + 1 < n) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, idx) =>
                    n === "…" ? (
                      <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-[12px]">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n as number)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-colors border"
                        style={
                          page === n
                            ? { background: "#800000", color: "#FFD700", borderColor: "#800000" }
                            : { color: "#6B7280", borderColor: "#E5E7EB" }
                        }
                      >
                        {n}
                      </button>
                    )
                  )}

                {/* Next */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 gap-4">
            <Bot className="h-14 w-14 text-gray-200" />
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1A1A1A]">No deliveries found</p>
              <p className="text-[12px] text-gray-400 mt-1">Try adjusting your search or filters, or <a href="/request-delivery" className="text-[#800000] hover:underline">create a new delivery request</a>.</p>
            </div>
            <button
              onClick={() => { setSearch(""); setStatus("All"); setRobot("All Robots"); setDateFrom(""); setDateTo(""); }}
              className="px-4 py-2 rounded-lg text-[12.5px] font-semibold border transition-colors hover:bg-red-50"
              style={{ borderColor: "#800000", color: "#800000" }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Delivery Details Modal */}
      <DeliveryDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        delivery={selectedDelivery}
      />
    </AppLayout>
  );
}