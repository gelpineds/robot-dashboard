import { Doughnut } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderColor?: string;
      borderWidth?: number;
    }>;
  };
  title?: string;
}

const defaultOptions: ChartOptions<"doughnut"> = {
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

export function DoughnutChart({ data, title }: DoughnutChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      {title && (
        <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400 mb-6">
          {title}
        </p>
      )}
      <div style={{ height: 240 }} className="flex items-center justify-center">
        <Doughnut data={data} options={defaultOptions} />
      </div>
    </div>
  );
}
