import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      borderWidth: number;
      pointRadius: number;
      pointBackgroundColor: string;
      tension: number;
      fill: boolean;
    }>;
  };
  title?: string;
}

const defaultOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: "#9CA3AF" },
    },
    y: {
      grid: { color: "#F3F4F6" },
      ticks: {
        font: { size: 11 },
        color: "#9CA3AF",
        callback: (v) => `${Number(v).toFixed(0)}m`,
      },
    },
  },
};

export function LineChart({ data, title }: LineChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      {title && (
        <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
          {title}
        </p>
      )}
      <div style={{ height: 280 }}>
        <Line data={data} options={defaultOptions} />
      </div>
    </div>
  );
}
