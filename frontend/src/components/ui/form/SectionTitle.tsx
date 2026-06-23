interface SectionTitleProps {
  icon: React.ElementType;
  label: string;
}

export function SectionTitle({ icon: Icon, label }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#800000" }}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <span className="text-[13px] font-semibold text-[#1A1A1A]">{label}</span>
    </div>
  );
}
