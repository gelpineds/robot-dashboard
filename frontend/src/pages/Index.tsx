import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { DoughnutChart, LineChart, BarChart } from "@/components/ui/charts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/utilities";
import { Bot, Package, MapPin, Users, Loader, Clock, Info, Send } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  ChartOptions,
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { robotsAPI, deliveriesAPI } from "@/lib/api";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "Monthly" | "Weekly" | "Today";

// ─── Mock data for fallback (for line/bar chart display formatting) ────────────────────
const fallbackLineDatasets: Record<Period, number[]> = {
  Monthly: [4200, 3800, 5100, 4700, 6200, 5800, 7100, 6800, 7500, 8200, 7900, 9100],
  Weekly:  [520, 480, 610, 570, 690, 640, 720],
  Today:   [20, 35, 28, 45, 38, 52, 47, 60, 55, 70, 65, 80],
};

const fallbackLineLabels: Record<Period, string[]> = {
  Monthly: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  Weekly:  ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  Today:   ["6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm"],
};

// Random bar data for daily deliveries (this is placeholder data)
const generateBarData = () => Array.from({ length: 30 }, (_, i) =>
  Math.floor(Math.random() * 55 + 15)
);

const rankColors: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "#FFD700", text: "#4a0000", label: "1st" },
  2: { bg: "#C0C0C0", text: "#1A1A1A", label: "2nd" },
  3: { bg: "#CD7F32", text: "#fff",    label: "3rd" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const doughnutOptions: ChartOptions<"doughnut"> = {
  cutout: "72%",
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
      },
    },
  },
};

function buildLineData(period: Period) {
  return {
    labels: fallbackLineLabels[period],
    datasets: [
      {
        label: "Avg Delivery Time (mins)",
        data: fallbackLineDatasets[period],
        borderColor: "#800000",
        backgroundColor: "rgba(128,0,0,0.12)",
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: "#800000",
        tension: 0.45,
        fill: true,
      },
    ],
  };
}

const lineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#9CA3AF" } },
    y: {
      grid: { color: "#F3F4F6" },
      ticks: {
        font: { size: 11 }, color: "#9CA3AF",
        callback: (v) => `${Number(v).toFixed(0)}m`,
      },
    },
  },
};

const buildBarChartData = (barData: number[]) => ({
  labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
  datasets: [
    {
      label: "Deliveries",
      data: barData,
      backgroundColor: "#800000",
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
});

const barOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#9CA3AF" } },
    y: { grid: { color: "#F3F4F6" }, ticks: { font: { size: 11 }, color: "#9CA3AF" } },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  // Declare all hooks at the top (BEFORE any early returns)
  const navigate = useNavigate();
  const [summaryPeriod, setSummaryPeriod] = useState<Period>("Monthly");
  const [revPeriod, setRevPeriod]         = useState<Period>("Monthly");

  // Fetch real-time data
  const { data: robots = [], isLoading: robotsLoading, isFetching: robotsFetching } = useQuery({
    queryKey: ['robots'],
    queryFn: robotsAPI.getAll,
    refetchInterval: 5000,
  });

  const { data: deliveries = [], isLoading: deliveriesLoading, isFetching: deliveriesFetching } = useQuery({
    queryKey: ['deliveries-all'],
    queryFn: deliveriesAPI.getAllDeliveries,
    refetchInterval: 5000,
  });

  // Only show loading on initial load, not during refetch
  const isInitialLoading = robotsLoading || deliveriesLoading;

  if (isInitialLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Calculate statistics from real data
  const totalRobots = robots.length;
  const totalDeliveries = deliveries.length;
  const activeDeliveries = (deliveries || []).filter((d: any) => d.status === 'in_transit').length;
  
  // Build doughnut data from deliveries
  const completedCount = (deliveries || []).filter((d: any) => d.status === 'delivered').length;
  const inTransitCount = (deliveries || []).filter((d: any) => d.status === 'in_transit').length;
  const pendingCount = (deliveries || []).filter((d: any) => d.status === 'pending_request').length;
  const failedCount = (deliveries || []).filter((d: any) => d.status === 'failed').length;
  
  const totalDeliveryCount = completedCount + inTransitCount + pendingCount + failedCount || 1;
  
  const doughnutData = {
    labels: ["Completed", "In Transit", "Pending", "Failed"],
    datasets: [
      {
        data: [
          Math.round((completedCount / totalDeliveryCount) * 100),
          Math.round((inTransitCount / totalDeliveryCount) * 100),
          Math.round((pendingCount / totalDeliveryCount) * 100),
          Math.round((failedCount / totalDeliveryCount) * 100),
        ],
        backgroundColor: ["#800000", "#FFD700", "#6B7280", "#EF4444"],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const completedPct = doughnutData.datasets[0].data[0];

  // Calculate average delivery time from completed deliveries
  const completedDeliveries = (deliveries || []).filter((d: any) => d.status === 'delivered');
  const avgDeliveryTime = completedDeliveries.length > 0
    ? Math.round(
        completedDeliveries.reduce((sum: number, d: any) => {
          const start = new Date(d.created_at).getTime();
          const end = new Date(d.updated_at).getTime();
          const minutes = (end - start) / (1000 * 60);
          return sum + minutes;
        }, 0) / completedDeliveries.length
      )
    : 0;

  // Calculate zones from real deliveries data
  const zoneMap = new Map<string, number>();
  (deliveries || []).forEach((d: any) => {
    const location = d.pickup_location || 'Unknown';
    zoneMap.set(location, (zoneMap.get(location) || 0) + 1);
  });

  const maxCount = Math.max(...Array.from(zoneMap.values()), 1);
  const zones = Array.from(zoneMap.entries())
    .map(([name, count]) => ({ name, count, max: maxCount }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6); // Top 6 zones

  // Generate bar chart data
  const barData = generateBarData();

  return (
    <AppLayout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Section 1: Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Robots"      value={totalRobots}    icon={Bot}     trend="+0 this semester" trendUp={false} />
          <StatCard title="Total Deliveries"  value={totalDeliveries} icon={Package} trend="+0% this month"  trendUp={false} />
          <StatCard title="Active Deliveries" value={activeDeliveries}    icon={MapPin} />
          <StatCard title="Completed"   value={completedCount}  icon={Users}   trend="+0 this week"     trendUp={false} />
        </div>

        {/* ── Section 1b: Quick Action Card ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#800000] to-[#600000] rounded-xl border border-[#800000]/20 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-[22px] font-bold text-white mb-1">Create New Delivery</h3>
              <p className="text-[13px] text-[#FFD700]/80">Start a new delivery request in seconds</p>
            </div>
            <button
              onClick={() => navigate("/request")}
              className="ml-4 flex items-center justify-center gap-2.5 px-6 py-3 bg-[#FFD700] text-[#800000] font-bold text-[13px] rounded-lg hover:bg-[#FFF8DC] active:scale-95 transition-all shadow-md whitespace-nowrap shrink-0"
            >
              <Send className="h-4 w-4" />
              Create Delivery
            </button>
          </div>
        </div>

        {/* ── Section 2: Doughnut + Line ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Delivery Summary doughnut */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#1A1A1A]">Delivery Summary</h2>
              {/* Period tabs */}
              <div className="flex gap-1 bg-gray-100 p-0.5 rounded-full">
                {(["Monthly", "Weekly", "Today"] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSummaryPeriod(p)}
                    className="px-3 py-1 text-[11px] font-semibold rounded-full transition-all"
                    style={
                      summaryPeriod === p
                        ? { background: "#800000", color: "#FFD700" }
                        : { color: "#6B7280" }
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-8">
              {/* Doughnut */}
              <div className="relative w-[160px] h-[160px] shrink-0">
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[26px] font-bold text-[#800000] leading-none">{completedPct}%</span>
                  <span className="text-[10px] text-gray-500 mt-0.5 font-medium">Completed</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-3">
                {doughnutData.labels.map((label, i) => {
                  const color = doughnutData.datasets[0].backgroundColor[i];
                  const val   = doughnutData.datasets[0].data[i];
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-[12px] text-gray-600">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${val}%`, background: color }}
                          />
                        </div>
                        <span className="text-[12px] font-semibold text-[#1A1A1A] w-8 text-right">{val}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Average Delivery Time line chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#1A1A1A]">Average Delivery Time</h2>
              <select
                value={revPeriod}
                onChange={(e) => setRevPeriod(e.target.value as Period)}
                className="text-[11px] font-medium border border-gray-200 rounded-lg px-2 py-1 text-gray-600 outline-none focus:border-[#800000] bg-white"
              >
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Today</option>
              </select>
            </div>
            <div className="h-[160px]">
              <Line data={buildLineData(revPeriod)} options={lineOptions} />
            </div>
          </div>
        </div>

        {/* ── Section 3: Bar + Trending Zones ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Daily Deliveries bar chart */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#1A1A1A]">Daily Deliveries</h2>
              <span className="text-[11px] text-gray-400 font-medium">This month</span>
            </div>
            <div className="h-[180px]">
              <Bar data={buildBarChartData(barData)} options={barOptions} />
            </div>
          </div>

          {/* Trending Delivery Zones */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#1A1A1A]">Trending Zones</h2>
              <span className="text-[11px] text-gray-400 font-medium">By deliveries</span>
            </div>
            <div className="space-y-3.5">
              {zones.map((zone, idx) => {
                const rank = idx + 1;
                const rc = rankColors[rank];
                const pct = Math.round((zone.count / zone.max) * 100);
                return (
                  <div key={zone.name} className="flex items-center gap-3">
                    {/* Rank badge */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={rc ? { background: rc.bg, color: rc.text } : { background: "#F3F4F6", color: "#6B7280" }}
                    >
                      {rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium text-[#1A1A1A] truncate">{zone.name}</span>
                        <span className="text-[11px] text-gray-500 font-semibold ml-2 shrink-0">{zone.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: "#800000" }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}