interface SummaryRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

export function SummaryRow({ icon: Icon, label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#800000" }} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-[12.5px] font-medium text-[#1A1A1A] mt-0.5 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}
