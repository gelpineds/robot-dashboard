interface Step {
  label: string;
  done: boolean;
  current: boolean;
}

interface StatusTimelineProps {
  steps: Step[];
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400 mb-5">Status Timeline</p>
      <div className="flex items-center justify-between relative">
        {/* Progress bar */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full -z-10">
          <div
            className="h-full bg-gradient-to-r rounded-full transition-all duration-300"
            style={{
              width: `${(steps.filter((s) => s.done).length / steps.length) * 100}%`,
              background: "linear-gradient(90deg, #800000 0%, #FFD700 100%)",
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center">
            {/* Circle */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all"
              style={{
                background: step.done ? "#800000" : step.current ? "#FFD700" : "#E5E7EB",
                color: step.done ? "#fff" : step.current ? "#800000" : "#9CA3AF",
                border: step.current ? "2px solid #800000" : "none",
              }}
            >
              {step.done ? "✓" : i + 1}
            </div>
            {/* Label */}
            <p
              className="text-[10px] font-semibold mt-2 text-center max-w-[80px] transition-colors"
              style={{
                color: step.done ? "#800000" : step.current ? "#FFD700" : "#9CA3AF",
              }}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
