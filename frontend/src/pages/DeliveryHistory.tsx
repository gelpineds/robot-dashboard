import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { HistoryTable, type HistoryRow, STATUS_STYLES } from "@/components/DeliveryTable";
import { Download, Search, Bot, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────
const ALL_DELIVERIES: HistoryRow[] = [
  { id: "DEL-20251", customer: "Juan Dela Cruz",    robot: "PUP-BOT Unit 1", from: "Registrar",       to: "CCIS 401",         datetime: "Jun 14, 2025 · 10:35 AM", status: "In Transit",  fee: 45 },
  { id: "DEL-20250", customer: "Maria Santos",      robot: "PUP-BOT Unit 2", from: "Research Office", to: "Main Bldg 203",    datetime: "Jun 14, 2025 · 10:20 AM", status: "Completed",   fee: 30 },
  { id: "DEL-20249", customer: "Jose Reyes",        robot: "PUP-BOT Unit 6", from: "OVPAA",           to: "Dept Heads",       datetime: "Jun 14, 2025 · 09:58 AM", status: "Completed",   fee: 55 },
  { id: "DEL-20248", customer: "Ana Gonzalez",      robot: "PUP-BOT Unit 2", from: "Registrar",       to: "CHK Faculty Rm",   datetime: "Jun 14, 2025 · 09:45 AM", status: "Completed",   fee: 30 },
  { id: "DEL-20247", customer: "Pedro Villanueva",  robot: "PUP-BOT Unit 3", from: "HR Office",       to: "Main Bldg 102",    datetime: "Jun 14, 2025 · 09:30 AM", status: "Failed",      fee: 0  },
  { id: "DEL-20246", customer: "Rosa Mendoza",      robot: "PUP-BOT Unit 1", from: "Dean's Office",   to: "Nantes Bldg 401",  datetime: "Jun 14, 2025 · 09:10 AM", status: "Completed",   fee: 40 },
  { id: "DEL-20245", customer: "Carlos Aquino",     robot: "PUP-BOT Unit 4", from: "Accounting",      to: "President Office", datetime: "Jun 13, 2025 · 04:50 PM", status: "Completed",   fee: 60 },
  { id: "DEL-20244", customer: "Linda Torres",      robot: "PUP-BOT Unit 6", from: "CCIS Faculty",    to: "Dean's Office",    datetime: "Jun 13, 2025 · 04:15 PM", status: "Completed",   fee: 30 },
  { id: "DEL-20243", customer: "Mark Ramos",        robot: "PUP-BOT Unit 3", from: "Library",         to: "CCIS 302",         datetime: "Jun 13, 2025 · 03:40 PM", status: "Pending",     fee: 35 },
  { id: "DEL-20242", customer: "Susan Castillo",    robot: "PUP-BOT Unit 1", from: "Research Office", to: "Nantes Bldg 205",  datetime: "Jun 13, 2025 · 03:00 PM", status: "Completed",   fee: 45 },
  { id: "DEL-20241", customer: "Ben Flores",        robot: "PUP-BOT Unit 2", from: "Registrar",       to: "Main Bldg 101",    datetime: "Jun 13, 2025 · 02:30 PM", status: "Completed",   fee: 30 },
  { id: "DEL-20240", customer: "Claire Soriano",    robot: "PUP-BOT Unit 5", from: "HR Office",       to: "CCIS 201",         datetime: "Jun 13, 2025 · 01:55 PM", status: "Failed",      fee: 0  },
  { id: "DEL-20239", customer: "Tony Navarro",      robot: "PUP-BOT Unit 3", from: "OVPAA",           to: "All Depts",        datetime: "Jun 13, 2025 · 01:20 PM", status: "Completed",   fee: 70 },
  { id: "DEL-20238", customer: "Diana Cruz",        robot: "PUP-BOT Unit 6", from: "Accounting",      to: "Main Bldg 304",    datetime: "Jun 13, 2025 · 12:45 PM", status: "Completed",   fee: 35 },
  { id: "DEL-20237", customer: "Ramon Bautista",    robot: "PUP-BOT Unit 1", from: "Dean's Office",   to: "CCIS 401",         datetime: "Jun 13, 2025 · 11:50 AM", status: "Completed",   fee: 40 },
];

const ROBOTS   = ["All Robots", "PUP-BOT Unit 1", "PUP-BOT Unit 2", "PUP-BOT Unit 3", "PUP-BOT Unit 4", "PUP-BOT Unit 5", "PUP-BOT Unit 6"];
const STATUSES = ["All", "Completed", "In Transit", "Pending", "Failed"];
const PAGE_SIZE = 8;

// ─── CSV export helper ────────────────────────────────────────────────────────
function exportCSV(rows: HistoryRow[]) {
  const headers = ["Order ID", "Customer", "Robot", "From", "To", "Date & Time", "Status", "Fee"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.id, `"${r.customer}"`, `"${r.robot}"`, `"${r.from}"`, `"${r.to}"`, `"${r.datetime}"`, r.status, r.fee].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "delivery-history.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DeliveryHistory() {
  const [search,      setSearch]      = useState("");
  const [status,      setStatus]      = useState("All");
  const [robot,       setRobot]       = useState("All Robots");
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [page,        setPage]        = useState(1);

  const filtered = useMemo(() => {
    setPage(1);
    return ALL_DELIVERIES.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.id.toLowerCase().includes(q) || d.customer.toLowerCase().includes(q);
      const matchStatus = status === "All" || d.status === status;
      const matchRobot  = robot  === "All Robots" || d.robot === robot;
      return matchSearch && matchStatus && matchRobot;
    });
  }, [search, status, robot, dateFrom, dateTo]);

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
            <select
              value={robot}
              onChange={(e) => setRobot(e.target.value)}
              className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#800000] text-gray-600 min-w-[160px]"
            >
              {ROBOTS.map((r) => <option key={r}>{r}</option>)}
            </select>
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
              <HistoryTable data={paginated} />
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
              <p className="text-[12px] text-gray-400 mt-1">Try adjusting your search or filters.</p>
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
    </AppLayout>
  );
}