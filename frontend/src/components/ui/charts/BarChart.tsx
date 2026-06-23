import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string | string[];
      borderRadius: number | number[];
      borderSkipped?: boolean | string | false;
    }>;
  };
  title?: string;
}

const defaultOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 }, color: "#9CA3AF" },
    },
    y: {
      grid: { color: "#F3F4F6" },
      ticks: { font: { size: 11 }, color: "#9CA3AF" },
    },
  },
};

export function BarChart({ data, title }: BarChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      {title && (
        <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
          {title}
        </p>
      )}
      <div style={{ height: 280 }}>
        <Bar data={data} options={defaultOptions} />
      </div>
    </div>
  );
}
